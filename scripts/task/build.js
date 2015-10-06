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

  var webappsDist;
  var webappsDir = [srcDir, 'webapps'].join(path.sep);
  var copyWebappContents = function(fromDirName, toDirName, exclusions, cb) {
    var src = [[webappsDir, fromDirName, '**', '*'].join(path.sep)];
    var i;
    if(exclusions && exclusions.length > 0) {
      i = exclusions.length;
      while(--i > -1) {
        src.push('!' + [webappsDir, fromDirName, exclusions[i]].join(path.sep));
      }
    }
    gulp.src(src)
             .pipe(gulp.dest([webappsDist, toDirName].join(path.sep)))
             .on('end', cb);
  };
  var copyStaticToWebapp = function(webappDirName, cb) {
    gulp.src([srcDir, 'static', '**', '*'].join(path.sep))
        .pipe(gulp.dest([webappsDist, webappDirName].join(path.sep)))
        .on('end', cb);
  };

  gulp.task('clean-build', function(cb) {
    var generate = function() {
        mkdir.sync(distDir);
        mkdir.sync([distDir, 'webapps'].join(path.sep));
        webappsDist = [distDir, 'webapps'].join(path.sep);
        gutil.log('Created new dist directory: ' + distDir);
        gutil.log('Webapps deployed in dist at: ' + webappsDist);
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
        .pipe(gulp.dest(webappsDist))
        .on('end', cb);
  });

  gulp.task('copy-contents-root', ['copy-src'], function(cb) {
    copyWebappContents('root', 'root', ['index.jsp'], cb);
  });

  gulp.task('copy-contents-live', ['copy-src'], function(cb) {
    copyWebappContents('live', 'live', ['index.jsp', 'broadcast.jsp', 'subscribe.jsp'], cb);
  });

  gulp.task('copy-static-root', ['copy-contents-root'], function(cb) {
    copyStaticToWebapp('root', cb);
  });

  gulp.task('copy-static-live', ['copy-contents-live'], function(cb) {
    copyStaticToWebapp('live', cb);
  });

  gulp.task('build-root', ['copy-static-root'], function(cb) {
    gulp.src([webappsDir, 'root', 'index.jsp'].join(path.sep))
        .pipe(handlebars({}, options))
        .pipe(rename('index.jsp'))
        .pipe(gulp.dest([webappsDist, 'root'].join(path.sep)))
        .on('end', cb);
  });

  gulp.task('build-live', ['copy-static-live'], function(cb) {
    var buildBroadcaster = function(cb) {
      return function() {
        gulp.src([webappsDir, 'live', 'broadcast.jsp'].join(path.sep))
            .pipe(handlebars({}, options))
            .pipe(rename('broadcast.jsp'))
            .pipe(gulp.dest([webappsDist, 'live'].join(path.sep)))
            .on('end', cb);
      };
    };
    var buildSubscriber = function(cb) {
      return function() {
        gulp.src([webappsDir, 'live', 'subscribe.jsp'].join(path.sep))
            .pipe(handlebars({}, options))
            .pipe(rename('subscribe.jsp'))
            .pipe(gulp.dest([webappsDist, 'live'].join(path.sep)))
            .on('end', cb);
      };
    };
    gulp.src([webappsDir, 'live', 'index.jsp'].join(path.sep))
        .pipe(handlebars({}, options))
        .pipe(rename('index.jsp'))
        .pipe(gulp.dest([webappsDist, 'live'].join(path.sep)))
        .on('end', buildBroadcaster(buildSubscriber(cb)));
  });

  gulp.task('build', [
                      'clean-build',
                      'copy-src',
                      'build-root', 'copy-contents-root', 'copy-static-root',
                      'build-live', 'copy-contents-live', 'copy-static-live'
                      ]);

};
