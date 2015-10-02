'use strict';

var path = require('path');
var rm = require('del');

module.exports = function(distDir, deployDir, gulp) {

  gulp.task('clean-deploy', function(cb) {
    rm(deployDir, function(err) {
      if(err) {
        console.error('Error in removing ' + deployDir + ': ' + err);
      }
      cb(err);
    });
  });

  gulp.task('copy-dist', ['clean-deploy'], function(cb) {
    gulp.src([distDir, 'webapps', '**', '*'].join(path.sep))
        .pipe(gulp.dest(deployDir))
        .on('end', cb);
  });

  gulp.task('deploy', [
                        'clean-deploy',
                        'copy-dist'
                        ]);

};
