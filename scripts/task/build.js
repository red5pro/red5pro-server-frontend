'use strict';

var path = require('path');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var mkdir = require('mkdirp');
var rm = require('del');

var options = {
  batch: [[process.cwd(), 'src', 'template', 'partial'].join(path.sep)]
};

module.exports = function(srcDir, distDir, gulp, gulpsync) {

  srcDir = [srcDir, 'webapps'].join(path.sep);

  gulp.task('clean-build', function(cb) {
    rm(distDir, function(err) {
      if(err) {
        console.error('Error in removing ' + distDir + ': ' + err);
      }
      mkdir.sync(distDir);
      mkdir.sync([distDir, 'webapps'].join(path.sep));
      distDir = [distDir, 'webapps'].join(path.sep);
      cb(err);
    });
  });

  gulp.task('build-root', function(cb) {
    return gulp.src([srcDir, 'root', 'index.jsp'].join(path.sep))
                .pipe(handlebars({}, options))
                .pipe(rename('index.jsp'))
                .pipe(gulp.dest([distDir, 'root'].join(path.sep)));
  });

  gulp.task('build', gulpsync(['clean-build', 'build-root'], function() {
  }));

};
