'use strict';

var path = require('path');
var rm = require('del');
var flatten = require('gulp-flatten');

module.exports = function(distDir, deployWebappDir, deployLibDir, gulp) {

  gulp.task('clean-deploy', ['build'], function(cb) {
    rm(deployWebappDir, function(err) {
      if(err) {
        console.error('Error in removing ' + deployWebappDir + ': ' + err);
      }
      cb(err);
    });
  });

  gulp.task('copy-dist', ['clean-deploy'], function(cb) {
    gulp.src([distDir, 'webapps', '**', '*'].join(path.sep))
        .pipe(gulp.dest(deployWebappDir))
        .on('end', cb);
  });

  gulp.task('copy-libs', ['copy-dist'], function(cb) {
    gulp.src([distDir, 'webapps', '**', 'lib', '**', '*.jar'].join(path.sep))
        .pipe(flatten())
        .pipe(gulp.dest(deployLibDir))
        .on('end', cb);
  })

  gulp.task('deploy', [
                        'build',
                        'clean-deploy',
                        'copy-dist',
                        'copy-libs'
                        ]);

};
