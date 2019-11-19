'use strict';

var openProcess;
var path = require('path');
var exec = require('child_process').exec;
var lr = require('tiny-lr')();
var watch = require('chokidar').watch;
var livereloadPort = 35729;
require('colors');

module.exports = function(srcDir, distDir, gulp, buildTask) {

  var reload = function(cb) {
    lr.listen(livereloadPort, function() {
      console.log(('livereload listening on ' + livereloadPort + '...').white);
      var watchOpts = {persistent: true, ignoreInitial: true};
      watch(distDir, watchOpts).on('all', function(event, filepath) {
        lr.changed({
          body: {
            files: [filepath]
          }
        });
      });
      cb();
    });
  };

  gulp.task('watch', function() {
    reload(function() {
      gulp.watch([srcDir, '**', '*'].join(path.sep), gulp.series([buildTask, 'deploy']))
        .on('change', function(event) {
            console.log(event);
            console.log(('File ' + event + ' was ' + event.type + ', reloading...').cyan);
          });
      openProcess = exec('npm run launch', function(error, stdout, stderror) {
        console.log(stdout);
        if(stderror) {
          console.error(stderror);
        }
      });
      openProcess.stdout.on('data', function(data) {
        console.log(data.toString());
      });
    });
  });

};
