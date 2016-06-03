'use strict';

var fs = require('fs');
var path = require('path');
var del = require('del');
var mkdir = require('mkdirp');
var chalk = require('chalk');
var exec = require('child_process').exec;
var Promise = require('bluebird');

var log = require([__dirname, 'log'].join(path.sep));

var clean = function(options) {
  return new Promise(function(resolve, reject) {
    try {
      log(chalk.yellow('Removing previous workspace at ' + options.workspace + '...'));
      del.sync(options.workspace, {force:true});
      mkdir.sync(options.workspace);
      resolve();
    }
    catch(e) {
      reject(e);
    }
  });
};

var init = function(options) {
  return new Promise(function(resolve, reject) {
    log(chalk.white('Initializing new webapp build for ' + options.name + '...'));
    var child = exec('git init', options, function(err) {
      if(err) {
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

var addRemote = function(options) {
  return new Promise(function(resolve, reject) {
    log(chalk.white('Setting up new webapp build for ' + options.name + ' from ' + options.repositoryUrl + '...'));
   var child = exec(['git remote add', options.name, options.repositoryUrl].join(' '), options, function(err) {
      if(err) {
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

var fetch = function(options) {
  return new Promise(function(resolve, reject) {
    log(chalk.yellow('Fetching ' + options.name + '...'));
    var child = exec(['git fetch', options.name].join(' '), options, function(err) {
      log(chalk.gray('Fetched.'));
      if(err) {
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

var checkout = function(options) {
  return new Promise(function(resolve, reject) {
    log(chalk.yellow('Checking out branch ' + options.branch + '...'));
    var child = exec('git checkout ' + options.branch, options, function(err) {
      if(err) {
        reject(err);
      }
      else {
          var configFile = [options.cwd, 'configuration.json'].join(path.sep);
          if(!fs.existsSync(configFile)) {
            reject('Could not find configuration file for ' + options.name + ' webapp. Aborting...');
          }
          else {
            resolve({
              child: child,
              config: JSON.parse(fs.readFileSync(configFile).toString())
            });
          }
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var buildWebapp = function(options) {
  return new Promise(function(resolve, reject) {
    if(options.cmd) {
      var command = chalk.magenta([options.cwd, options.cmd].join(' $ '));
      log(
        chalk.yellow('Building ' + options.name + ' using ' + command + '...')
      );
      var child = exec([options.cmd, '> /dev/null'].join(' '), options, function(err) {
        if(err) {
          reject(err);
        }
        else {
          var output = [options.cwd, options.outDir].join(path.sep);
          try {
            log(chalk.white('Exists? ' + output));
            log(chalk.white(JSON.stringify(fs.statSync(output), null, 2)));
            resolve({
              child: child
            });
          }
          catch(e) {
            log(chalk.red('Output path does not exist.'));
            reject(e);
          }
        }
      });
      child.stdout.pipe(process.stdout);
    }
    else {
      resolve();
    }
  });
};

var addWebappLibDependencies = function(options) {
  return new Promise(function(resolve, reject) {
    if(options.libDir) {
      var cmd = 'mkdir -p ' + options.outLibDir + ' && ' +
                'cp -rf ' + options.libDir + '/* ' + options.outLibDir
      log(
        chalk.yellow([options.cwd, cmd].join(' $ '))
      )
      var child = exec(cmd, options, function(err) {
        if(err) {
          reject(err);
        }
        else {
          var output = [options.cwd, options.outLibDir].join(path.sep);
          try {
            log(chalk.white('Lib Exists? ' + output));
            log(chalk.white(JSON.stringify(fs.statSync(output), null, 2)));
            resolve({
              child: child
            });
          }
          catch(e) {
            log(chalk.red('Output path does not exist.'));
            reject(e);
          }
        }
      });
      child.stdout.pipe(process.stdout);
    }
    else {
      resolve();
    }
  });
};


module.exports = {
  clean: clean,
  init: init,
  addRemote: addRemote,
  fetch: fetch,
  checkout: checkout,
  buildWebapp: buildWebapp,
  addLibs: addWebappLibDependencies
};
