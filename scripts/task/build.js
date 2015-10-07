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
    copyWebappContents('live', 'live', [
      'index.jsp',
      'broadcast.jsp',
      'subscribe.jsp'
    ], cb);
  });

  gulp.task('copy-contents-secondscreen', ['copy-src'], function(cb) {
    copyWebappContents('secondscreen', 'secondscreen', [
      'index.jsp',
      ['hosts', 'html', 'index.jsp'].join(path.sep),
      ['hosts', 'gamepad', 'index.jsp'].join(path.sep),
      ['hosts', 'dpad', 'index.jsp'].join(path.sep)
    ], cb);
  });

  gulp.task('copy-static-root', ['copy-contents-root'], function(cb) {
    copyStaticToWebapp('root', cb);
  });

  gulp.task('copy-static-live', ['copy-contents-live'], function(cb) {
    copyStaticToWebapp('live', cb);
  });

  gulp.task('copy-static-secondscreen', ['copy-contents-secondscreen'], function(cb) {
    copyStaticToWebapp('secondscreen', cb);
  });

  gulp.task('build-root', ['copy-static-root'], function(cb) {
    gulp.src([webappsDir, 'root', 'index.jsp'].join(path.sep))
        .pipe(handlebars({}, options))
        .pipe(rename('index.jsp'))
        .pipe(gulp.dest([webappsDist, 'root'].join(path.sep)))
        .on('end', cb);
  });

  gulp.task('build-live', ['copy-static-live'], function(cb) {
    var buildStreamPage = function(page, cb) {
      return function() {
        gulp.src([webappsDir, 'live', page].join(path.sep))
            .pipe(handlebars({}, options))
            .pipe(rename(page))
            .pipe(gulp.dest([webappsDist, 'live'].join(path.sep)))
            .on('end', cb);
      };
    };
    var buildSubscriber = buildStreamPage('subscribe.jsp', cb);
    var buildBroadcaster = buildStreamPage('broadcast.jsp', buildSubscriber);
    buildStreamPage('index.jsp', buildBroadcaster)();
  });

  gulp.task('build-secondscreen', ['copy-static-secondscreen'], function(cb) {
    gulp.src([webappsDir, 'secondscreen', 'index.jsp'].join(path.sep))
        .pipe(handlebars({}, options))
        .pipe(rename('index.jsp'))
        .pipe(gulp.dest([webappsDist, 'secondscreen'].join(path.sep)))
        .on('end', cb);
  });

  gulp.task('build-secondscreen-examples', ['build-secondscreen'], function(cb) {
    gutil.log('Building Second Screen examples...');
    var buildSecondScreenHost = function(subdir, cb) {
      return function() {
        gutil.log('Building example in ' + subdir + '...');
        gulp.src([webappsDir, 'secondscreen', subdir, 'index.jsp'].join(path.sep))
            .pipe(handlebars({}, options))
            .pipe(rename('index.jsp'))
            .pipe(gulp.dest([webappsDist, 'secondscreen', subdir].join(path.sep)))
            .on('end', cb);
      };
    };
    var buildDpad = buildSecondScreenHost(['hosts', 'dpad'].join(path.sep), cb);
    var buildGamepad = buildSecondScreenHost(['hosts', 'gamepad'].join(path.sep), buildDpad);
    buildSecondScreenHost(['hosts', 'html'].join(path.sep), buildGamepad)();
  });

  gulp.task('build', [
                      'clean-build',
                      'copy-src',
                      'build-root', 'copy-contents-root', 'copy-static-root',
                      'build-live', 'copy-contents-live', 'copy-static-live',
                      'build-secondscreen', 'build-secondscreen-examples', 'copy-contents-secondscreen', 'copy-static-secondscreen'
                      ]);

};
