'use strict';

var path = require('path');
var gutil = require('gulp-util');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var zip = require('gulp-zip');

var WebAppBuilder = require('./WebAppBuilder');

module.exports = function(srcDir, distDir, gulp, templateOptions) {

  var webappDirName = 'secondscreen';
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-');
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-');
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-');
  var buildExamplesTaskLabel = ['build-examples-webapp', webappDirName].join('-');
  var zipExamplesTaskLabel = ['zip-examples-webapp', webappDirName].join('-');

  var Builder = new WebAppBuilder(webappDirName, srcDir, distDir,
                                  gulp, templateOptions);

  return function(initChain) {

    gulp.task(generateTaskLabel, [initChain], function(cb) {
      gutil.log('Generating Webapps Page: ' + webappDirName);
      Builder.generateIndexPage(cb);
    });

    gulp.task(copyContentsTaskLabel, [generateTaskLabel], function(cb) {
      Builder.copyWebappContents([
        'index.jsp',
        ['hosts', 'html', 'index.jsp'].join(path.sep),
        ['hosts', 'gamepad', 'index.jsp'].join(path.sep),
        ['hosts', 'dpad', 'index.jsp'].join(path.sep)
      ], cb);
    });

    gulp.task(copyStaticTaskLabel, [copyContentsTaskLabel], function(cb) {
      Builder.copyStatic([], cb);
    });

    gulp.task(buildExamplesTaskLabel, [copyStaticTaskLabel], function(cb) {
      gutil.log('Building Second Screen examples...');
      var buildSecondScreenHost = function(subdir, cb) {
        return function() {
          gutil.log('Building example in ' + subdir + '...');
          var target = [Builder.webappSourceDirectory, subdir, 'index.jsp'].join(path.sep);
          var out = [Builder.webappDestinationDirectory, subdir].join(path.sep);
          gulp.src(target)
              .pipe(handlebars({}, templateOptions))
              .pipe(rename('index.jsp'))
              .pipe(gulp.dest(out))
              .on('end', cb);
        };
      };
      var buildDpad = buildSecondScreenHost(['hosts', 'dpad'].join(path.sep), cb);
      var buildGamepad = buildSecondScreenHost(['hosts', 'gamepad'].join(path.sep), buildDpad);
      buildSecondScreenHost(['hosts', 'html'].join(path.sep), buildGamepad)();
    });

    gulp.task(zipExamplesTaskLabel, [buildExamplesTaskLabel], function(cb) {
      var zipBuild = function(name, callback) {
        return function() {
          var sourceDir = [Builder.webappDestinationDirectory, 'hosts', name, '**'].join(path.sep);
          var downloadsDir = [Builder.webappDestinationDirectory, 'downloads'].join(path.sep);
          gutil.log('Zipping Second Screen example: ' + name + '...');
          gulp.src(sourceDir)
              .pipe(zip([name, 'zip'].join('.')))
              .pipe(gulp.dest(downloadsDir))
              .on('end', function(err) {
                if(err) {
                  gutil.log('Error in zipping archive: ' + err);
                }
                callback();
              });
        };
      };
      var zipDPAD = zipBuild('dpad', cb);
      var zipGamepad = zipBuild('gamepad', zipDPAD);
      zipBuild('html', zipGamepad)();
    });

    return [
      generateTaskLabel,
      copyContentsTaskLabel,
      copyStaticTaskLabel,
      buildExamplesTaskLabel,
      zipExamplesTaskLabel
    ];

  };

};
