'use strict';

var path = require('path');
var gulp = require('gulp');

var port = 5080;
var nconf = require('nconf');
nconf.argv().env().file({
  file: 'settings.json'
});

var taskDirectory = [process.cwd(), 'scripts', 'task'].join(path.sep);

var srcDir = [process.cwd(), 'src'].join(path.sep);
var distDir = [process.cwd(), 'dist'].join(path.sep);
var deployDir = nconf.get('red5pro-server')
  ? [nconf.get('red5pro-server'), 'webapps'].join(path.sep)
  : [process.cwd(), 'red5pro-server', 'webapps'].join(path.sep);

// Import build task
var buildSetup = require([taskDirectory, 'build.js'].join(path.sep))(srcDir, distDir, gulp);

// Import deploy task
var deploySetup = require([taskDirectory, 'deploy.js'].join(path.sep))(distDir, deployDir, gulp);

// Import watch task
var watchSetup = require([taskDirectory, 'watch.js'].join(path.sep))(srcDir, distDir, gulp, 'deploy');

// Import launch task
var launchSetup = require([taskDirectory, 'launch.js'].join(path.sep))(port, gulp);

