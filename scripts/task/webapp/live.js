'use strict';

var gutil = require('gulp-util');
var WebAppBuilder = require('./WebAppBuilder');

module.exports = function(srcDir, distDir, gulp, templateOptions) {

  var webappDirName = 'live';
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-');
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-');
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-');

  var Builder = new WebAppBuilder(webappDirName, srcDir, distDir,
                                  gulp, templateOptions);

  return function(initChain) {

    gulp.task(generateTaskLabel, [initChain], function(cb) {
      gutil.log('Generating Webapps Page: ' + webappDirName);
      var buildPage = function(page, cb) {
        return function() {
          gutil.log('Generating [' + webappDirName + '] Page: ' + page);
          return Builder.generatePage(page, cb);
        };
      };
      var buildSubscriber = buildPage('subscribe.jsp', cb);
      var buildBroadcaster = buildPage('broadcast.jsp', buildSubscriber);
      var buildPlayback = buildPage('playback.jsp', buildBroadcaster);
      var buildTwoWay = buildPage('twoway.jsp', buildPlayback);
      Builder.generateIndexPage(buildTwoWay);
    });
    gulp.task(copyContentsTaskLabel, [generateTaskLabel], function(cb) {
      Builder.copyWebappContents([
        'index.jsp',
        'broadcast.jsp',
        'subscribe.jsp',
        'playback.jsp',
        'twoway.jsp'
      ], cb);
    });
    gulp.task(copyStaticTaskLabel, [copyContentsTaskLabel], function(cb) {
      Builder.copyStatic([], cb);
    });

    return [
      generateTaskLabel,
      copyContentsTaskLabel,
      copyStaticTaskLabel
      /* Add any additional task names with properly dependency chain defined. */
    ];

  };

};
