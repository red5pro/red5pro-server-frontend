'use strict';

var path = require('path');
var rm = require('del');

module.exports = function(distDir, deployDir, gulp, gulpsync) {

  gulp.task('cleandeploy', function(cb) {
    rm(deployDir, function(err) {
      if(err) {
        console.error('Error in removing ' + deployDir + ': ' + err);
      }
      cb(err);
    });
  });

  gulp.task('copydist', function(cb) {
    return gulp.src([distDir, 'webapps', '**', '*'].join(path.sep))
                .pipe(gulp.dest(deployDir));
  });

  gulp.task('deploy', gulpsync([
                        'clean-deploy',
                        'copy-dist'
                        ], function() {
  }));

};
