'use strict';

var gutil = require('gulp-util');
var WebAppBuilder = require('./WebAppBuilder');

module.exports = function(srcDir, distDir, gulp, templateOptions) {

  var webappDirName = 'root';
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-');
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-');
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-');

  var Builder = new WebAppBuilder(webappDirName, srcDir, distDir,
                                  gulp, templateOptions);

  return function(initChain) {

    gulp.task(generateTaskLabel, [initChain], function(cb) {
      gutil.log('Generating Webapps Page: ' + webappDirName);
      Builder.generateIndexPage(cb);
    });
    gulp.task(copyContentsTaskLabel, [generateTaskLabel], function(cb) {
      Builder.copyWebappContents(['index.jsp'], cb);
    });
    gulp.task(copyStaticTaskLabel, [copyContentsTaskLabel], function(cb) {
      Builder.copyStatic([], cb);
    });

    return [
      generateTaskLabel,
      copyContentsTaskLabel,
      copyStaticTaskLabel
    ];

  };

};
