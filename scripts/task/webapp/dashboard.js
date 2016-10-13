'use strict';

var path = require('path');
var gutil = require('gulp-util');
var WebAppBuilder = require('./WebAppBuilder');
var childProcess = require('child_process');
var exec = childProcess.execSync;

module.exports = function(srcDir, distDir, gulp, templateOptions) {

  var webappDirName = 'dashboard';
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-');
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-');
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-');

  var Builder = new WebAppBuilder(webappDirName, srcDir, distDir,
                                  gulp, templateOptions);

  return function(initChain) {
    gulp.task(generateTaskLabel, [initChain], function(cb) {
      var curDir = exec('pwd', {cwd: __dirname}).toString('utf-8');
      gutil.log('Current directory: ' + curDir);
      
      var taskDir = curDir.substring(0, curDir.lastIndexOf('/'));
      gutil.log('Task directory: ' + taskDir);
      gutil.log( exec('cd ' + taskDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      var scriptsDir = taskDir.substring(0, taskDir.lastIndexOf('/'));
      gutil.log('Scripts directory: ' + scriptsDir);
      gutil.log( exec('cd ' + scriptsDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      var parentDir = scriptsDir.substring(0, scriptsDir.lastIndexOf('/'));
      gutil.log('Parent directory: ' + parentDir);
      gutil.log( exec('cd ' + parentDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      var srcDir = parentDir + '/src';
      gutil.log('Src directory: ' + srcDir);
      gutil.log( exec('cd ' + srcDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      var webAppsDir = srcDir + '/webapps';
      gutil.log('WebApps directory: ' + webAppsDir);
      gutil.log( exec('cd ' + webAppsDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      var dashboardDir = webAppsDir + '/dashboard';
      gutil.log('Dashboard directory: ' + dashboardDir);
      gutil.log( exec('cd ' + dashboardDir + '; pwd', {cwd: __dirname}).toString('utf-8') );

      gutil.log('bundling-es6-files. This could take a few minutes.');
      gutil.log( exec('pwd; cd ' + dashboardDir + '; pwd; npm install; npm run build', {cwd: __dirname}).toString('utf-8') ); // Go to the dashboard and execute build commands
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
