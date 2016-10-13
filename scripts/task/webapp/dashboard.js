'use strict';

var path = require('path');
var gutil = require('gulp-util');
var WebAppBuilder = require('./WebAppBuilder');
var exec = require('child_process').execSync;

module.exports = function(srcDir, distDir, gulp, templateOptions) {

  var webappDirName = 'dashboard';
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-');
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-');
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-');

  var Builder = new WebAppBuilder(webappDirName, srcDir, distDir,
                                  gulp, templateOptions);

  return function(initChain) {
    gulp.task(generateTaskLabel, [initChain], function(cb) {
      gutil.log('dir name: ' + __dirname);
      var dashboardPath = path.resolve(__dirname + '/src/webapps/dashboard');
      gutil.log('dashboard path: ' + dashboardPath);
      gutil.log('bundling-es6-files. This could take a few minutes.');
      exec('cd ' + dashboardPath + ' && npm install && npm run build'); // Go to the dashboard and execute build commands
      gutil.log('Generating Webapps Page: ' + webappDirName);
      var buildPage = function(page, cb) {
        return function() {
          gutil.log('Generating [' + webappDirName + '] Page: ' + page);
          return Builder.generatePage(page, cb);
        };
      };
      var buildClients= buildPage('clients.jsp', cb);
      var buildVOD = buildPage('vod.jsp', buildClients);
      Builder.generateIndexPage(buildVOD);
    });

    gulp.task(copyContentsTaskLabel, [generateTaskLabel], function(cb) {
      // Add relative file paths to exclude to the array.
      // * File paths are relative to the src/webapps/<your-webapp> directory
      Builder.copyWebappContents([
        'index.jsp',
        'clients.jsp',
        'vod.jsp'
      ], cb);
    });

    gulp.task(copyStaticTaskLabel, [copyContentsTaskLabel], function(cb) {
      // Add relative file paths to exclude to the array.
      // * File paths are relative to the src/static directory
      Builder.copyStatic([], cb);
    });

    /**
     * Add additional tasks, ensuring the dependency chain as shown by the above tasks.
     * <pre>
     *  gulp.task(<taskName>, [<previous-dependency-task-name>], function(cb) { <operation> });
     * </pre>
     */

    return [
      generateTaskLabel,
      copyContentsTaskLabel,
      copyStaticTaskLabel
      /* Add any additional task names with properly dependency chain defined. */
    ];

  };

};
