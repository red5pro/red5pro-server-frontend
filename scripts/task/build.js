'use strict';

var fs = require('fs');
var path = require('path');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var mkdir = require('mkdirp');
var rm = require('del');
var gutil = require('gulp-util');

var options = {
  batch: [[process.cwd(), 'src', 'template', 'partial'].join(path.sep)]
};

module.exports = function(srcDir, distDir, gulp) {

  var webappsDir = [srcDir, 'webapps'].join(path.sep);

  gulp.task('clean-build', function(cb) {
    var generate = function() {
        mkdir.sync(distDir);
        mkdir.sync([distDir, 'webapps'].join(path.sep));
        distDir = [distDir, 'webapps'].join(path.sep);
        gutil.log('Created new dist directory: ' + distDir);
    };

    if(fs.existsSync(distDir)) {
      rm(distDir, function(err) {
        if(err) {
          gutil.log('Error in removing ' + distDir + ': ' + err);
        }
        gutil.log('Removed old dist build.');
        generate();
        cb(err);
      });
    }
    else {
        generate();
        cb();
    }
  });

  gulp.task('copy-src', ['clean-build'], function(cb) {
    gulp.src([webappsDir, '*'].join(path.sep))
        .pipe(gulp.dest(distDir))
        .on('end', cb);
  });

  gulp.task('copy-contents-root', ['copy-src'], function(cb) {
    gulp.src([
              [webappsDir, 'root', '**', '*'].join(path.sep),
              '!' + [webappsDir, 'root', 'index.jsp'].join(path.sep)
             ])
             .pipe(gulp.dest([distDir, 'root'].join(path.sep)))
             .on('end', cb);
  });

  gulp.task('copy-static-root', ['copy-contents-root'], function(cb) {
    gulp.src([srcDir, 'static', '**', '*'].join(path.sep))
        .pipe(gulp.dest([distDir, 'root'].join(path.sep)))
        .on('end', cb);
  });

  gulp.task('build-root', ['copy-static-root'], function(cb) {
    gulp.src([webappsDir, 'root', 'index.jsp'].join(path.sep))
        .pipe(handlebars({}, options))
        .pipe(rename('index.jsp'))
        .pipe(gulp.dest([distDir, 'root'].join(path.sep)))
        .on('end', cb);
  });

  gulp.task('build', [
                      'clean-build',
                      'copy-src',
                      'build-root', 'copy-contents-root', 'copy-static-root'
                      ]);

};
