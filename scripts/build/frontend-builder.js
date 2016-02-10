'use strict';

var path = require('path');
var exec = require('child_process').exec;
var chalk = require('chalk');
var gulp = require('gulp');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var Promise = require('bluebird');

var log = require([__dirname, 'log'].join(path.sep));

var addWebappToBuild = function(buildFile, taskDirectory, config) {
  return new Promise(function(resolve, reject) {
    log(chalk.yellow('Adding ' + config.webappName + ' to build process...'));
    try {
      gulp.src(buildFile)
          .pipe(replace('@webapp@', config.webappName))
          .pipe(rename([config.webappName, 'js'].join('.')))
          .pipe(gulp.dest(taskDirectory))
          .on('end', resolve)
          .on('error', reject);
    }
    catch(e) {
      reject(e)
    }
  });
};

var addWebappsToBuild = function(webapps, buildFile, taskDirectory) {
  return Promise.each(webapps, function(config) {
    return addWebappToBuild(buildFile, taskDirectory, config);
  });
};

var generate = function(cwd, buildDirectory) {
  var dir = chalk.magenta(buildDirectory);
  log(chalk.yellow('Running build of front-end to ' + dir + '...'));
  return new Promise(function(resolve, reject) {
    var child = exec('npm run build', {cwd: cwd}, function(err) {
      if(err) {
        log(chalk.red('Error in building: ' + err));
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};


module.exports = {
  addWebappToBuild: addWebappToBuild,
  addWebappsToBuild: addWebappsToBuild,
  generate: generate
};
