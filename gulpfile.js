'use strict';

var path = require('path');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var taskDirectory = [process.cwd(), 'scripts', 'task'].join(path.sep);

var srcDir = [process.cwd(), 'src'].join(path.sep);
var distDir = [process.cwd(), 'dist'].join(path.sep);

// Import build task
var buildSetup = require([taskDirectory, 'build.js'].join(path.sep))(srcDir, distDir, gulp, gulpsync.sync);
