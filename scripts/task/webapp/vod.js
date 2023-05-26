'use strict'

var gutil = require('gulp-util')
var WebAppBuilder = require('./WebAppBuilder')

module.exports = function (srcDir, distDir, gulp, templateOptions) {
  var webappDirName = 'vod'
  var generateTaskLabel = ['generate-webapp', webappDirName].join('-')
  var copyContentsTaskLabel = ['copy-contents-webapp', webappDirName].join('-')
  var copyStaticTaskLabel = ['copy-static-webapp', webappDirName].join('-')

  var Builder = new WebAppBuilder(
    webappDirName,
    srcDir,
    distDir,
    gulp,
    templateOptions
  )

  return function (initChain) {
    gulp.task(generateTaskLabel, [initChain], function (cb) {
      gutil.log('Generating Webapps Page: ' + webappDirName)
      Builder.generateIndexPage(cb)
    })

    gulp.task(copyContentsTaskLabel, [generateTaskLabel], function (cb) {
      // Add relative file paths to exclude to the array.
      // * File paths are relative to the src/webapps/<your-webapp> directory
      Builder.copyWebappContents(['index.jsp'], cb)
    })

    gulp.task(copyStaticTaskLabel, [copyContentsTaskLabel], function (cb) {
      // Add relative file paths to exclude to the array.
      // * File paths are relative to the src/static directory
      Builder.copyStatic([], cb)
    })

    /**
     * Add additional tasks, ensuring the dependency chain as shown by the above tasks.
     * <pre>
     *  gulp.task(<taskName>, [<previous-dependency-task-name>], function(cb) { <operation> });
     * </pre>
     */

    return [
      generateTaskLabel,
      copyContentsTaskLabel,
      copyStaticTaskLabel,
      /* Add any additional task names with properly dependency chain defined. */
    ]
  }
}
