'use strict';

var path = require('path');
var mkdir = require('mkdirp');
var replace = require('gulp-replace');

module.exports = function(srcDir, distDir, gulp) {

  var webappsDirectory = [srcDir, 'webapps'].join(path.sep);
  var tempDirectory = [webappsDirectory, 'tmp'].join(path.sep);
  var copyTemp = function(webappName, endpoint, cb) {
    gulp.src([tempDirectory, '**', '*'].join(path.sep))
        .pipe(replace('@webapp@', webappName))
        .pipe(gulp.dest(endpoint))
        .on('end', cb);
  };
  var addToBuildProcess = function(webappName) {
    // TODO.
    return function() {
    };
  };

  return function(webappName) {
    var directoryPath = [webappsDirectory, webappName].join(path.sep);
    mkdir.sync(directoryPath);
    copyTemp(webappName, directoryPath, addToBuildProcess(webappName));
  };

}

