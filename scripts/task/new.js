'use strict';

var path = require('path');
var mkdir = require('mkdirp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var gutil = require('gulp-util');

module.exports = function(srcDir, distDir, scriptsDir, gulp) {

  var webappsDirectory = [srcDir, 'webapps'].join(path.sep);
  var tempDirectory = [webappsDirectory, 'tmp'].join(path.sep);
  var webappBuildDirectory = [scriptsDir, 'task', 'webapp'].join(path.sep);
  var buildFile = [webappBuildDirectory, 'build.template.js'].join(path.sep);
  var copyTemp = function(webappName, endpoint, cb) {
    gutil.log('Generating webapp at ' + endpoint + '...');
    gulp.src([tempDirectory, '**', '*'].join(path.sep))
        .pipe(replace('@webapp@', webappName))
        .pipe(gulp.dest(endpoint))
        .on('end', cb);
  };
  var addToBuildProcess = function(webappName) {
    return function() {
      gulp.src(buildFile)
          .pipe(replace('@webapp@', webappName))
          .pipe(rename([webappName, 'js'].join('.')))
          .pipe(gulp.dest(webappBuildDirectory));
      gutil.log('Webapp added to build process at ' + webappBuildDirectory + '/' + webappName + '.js.');
    };
  };

  return function(webappName) {
    var directoryPath = [webappsDirectory, webappName].join(path.sep);
    mkdir.sync(directoryPath);
    copyTemp(webappName, directoryPath, addToBuildProcess(webappName));
  };

}

