'use strict';

var gutil = require('gulp-util');
var open = require('open');

module.exports = function(port, gulp) {

  gutil.log('Launch loaded...');

  gulp.task('launch', function() {
    open(['http://localhost', port].join(':'));
  });

};

