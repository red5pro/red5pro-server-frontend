'use strict';

var fs = require('fs');
var path = require('path');
var mkdir = require('mkdirp');
var rm = require('del');
var gutil = require('gulp-util');

var nconf = require('nconf');
nconf.argv().env().file({
  file: 'settings.json'
});

var options = {
  batch: [[process.cwd(), 'src', 'template', 'partial'].join(path.sep)],
  helpers: {
    server_version: function() {
      var version = 'UNKNOWN';
      try {
        version = nconf.get('version');
      }
      catch(e) {
        gutil.log('COULD NOT LOCATE VERSION');
      }
      finally {
        return version;
      }
    }
  }
};

module.exports = function(srcDir, distDir, webappBuildScriptDir, gulp) {

  var webappsDist;
  var webappsDir = [srcDir, 'webapps'].join(path.sep);

  gulp.task('clean-build', function(cb) {
    var generate = function() {
        mkdir.sync(distDir);
        mkdir.sync([distDir, 'webapps'].join(path.sep));
        webappsDist = [distDir, 'webapps'].join(path.sep);
        gutil.log('Created new dist directory: ' + distDir);
        gutil.log('Webapps deployed in dist at: ' + webappsDist);
    };

    if(fs.existsSync(distDir)) {
      rm(distDir, {force:true}, function(err) {
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
    gulp.src([[webappsDir, '*'].join(path.sep), '!' + [webappsDir, 'tmp'].join(path.sep)])
        .pipe(gulp.dest(webappsDist))
        .on('end', cb);
  });

  var webapps = fs.readdirSync(webappsDir).filter(function(filepath) {
    return fs.statSync([webappsDir, filepath].join(path.sep)).isDirectory();
  });
  var excludeFromWebappBuilds = function(filepath) {
    return webapps.indexOf(filepath.split('.js').shift()) > -1;
  };
  var tasks = ['clean-build', 'copy-src'];
  var buildTasks = fs.readdirSync(webappBuildScriptDir).filter(excludeFromWebappBuilds);
  buildTasks.forEach(function(taskFile) {
    var builder = require([webappBuildScriptDir, taskFile].join(path.sep));
    tasks = tasks.concat(builder(srcDir, distDir, gulp, options)('copy-src'));
  });

  gulp.task('build', tasks);

};
