'use strict';

var path = require('path');
var del = require('del');
var chalk = require('chalk');

var log = require([__dirname, 'log'].join(path.sep));
var buildWebapps = require([__dirname, 'build'].join(path.sep));
var menuBuilder = require([__dirname, 'menu-builder'].join(path.sep));
var moveWebapps = require([__dirname, 'move'].join(path.sep));
var frontEndBuilder = require([__dirname, 'frontend-builder'].join(path.sep));
var cleanWebapps = require([__dirname, 'clean'].join(path.sep));

var srcDirectory = [process.cwd(), 'src'].join(path.sep);
var buildDirectory = [process.cwd(), 'dist'].join(path.sep);
var webappTaskDirectory = [process.cwd(), 'scripts', 'task', 'webapp'].join(path.sep);
var buildFile = [webappTaskDirectory, 'build.template.js'].join(path.sep);

module.exports = function(manifest) {
  var keys = Object.keys(manifest);
  var webapps = keys.map(function(key) {
    return Object.assign(manifest[key], {
      name: key,
      workspace: ['', 'tmp', key].join(path.sep)
    });
  });

  return {
    generate: function() {
      del.sync(buildDirectory, {force: true});
      buildWebapps.all(webapps)
        .then(function() {
          return menuBuilder.update(webapps);
        })
        .then(function() {
          return moveWebapps.all(webapps, srcDirectory);
        })
        .then(function() {
          return frontEndBuilder.addWebappsToBuild(webapps, buildFile, webappTaskDirectory);
        })
        .then(function() {
          return frontEndBuilder.generate(process.cwd(), buildDirectory);
        })
        .then(function() {
          return cleanWebapps.all(webapps);
        })
        .then(function() {
          log(chalk.blue('Build complete.'));
        })
        .catch(function(err) {
          log(chalk.red('Build failed: ' + err));
        });
    }
  };

};
