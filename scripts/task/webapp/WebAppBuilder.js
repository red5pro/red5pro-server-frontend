'use strict';
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var handlebars = require('gulp-compile-handlebars');

var normalizeExclusionPaths = function(rootPath, exclusions) {
  var excl = exclusions || [];
  excl.forEach(function(filepath, index) {
      excl[index] = '!' + [rootPath, filepath].join(path.sep)
  });
  return excl;
};

var WebAppBuilder = function(name, srcDirectory, distDirectory, gulp, templateOptions) {
  this.name = name;
  this.sourceDirectory = srcDirectory;
  this.destinationDirectory = distDirectory;
  this.webappSourceDirectory = [this.sourceDirectory, 'webapps', this.name].join(path.sep);
  this.webappDestinationDirectory = [this.destinationDirectory, 'webapps', this.name].join(path.sep);

  this.gulp = gulp;
  this.templateOptions = templateOptions;
};

WebAppBuilder.prototype.generatePage = function(filepath, cb) {
  var page = filepath.split(path.sep).pop();
  var preTemplate = [this.webappSourceDirectory, filepath].join(path.sep);
  gutil.log('Generate page: ' + page + ', from ' + preTemplate)
  if (!fs.existsSync(preTemplate)) {
    gutil.log('Missing ' + preTemplate + '. Moving on...')
    cb();
    return;
  }
  this.gulp.src(preTemplate)
            .pipe(handlebars({}, this.templateOptions))
            .pipe(rename(page))
            .pipe(this.gulp.dest(this.webappDestinationDirectory))
            .on('end', cb);
};

WebAppBuilder.prototype.generateIndexPage = function(cb) {
  gutil.log('Generate Index Page')
  this.generatePage('index.jsp', cb);
};

WebAppBuilder.prototype.copyWebappContents = function(exclusions, cb) {
  gutil.log('Copy Webapp Contents')
  var srcDirectory = this.webappSourceDirectory;
  var src = [[this.webappSourceDirectory, '**', '*'].join(path.sep)];
  src = src.concat(normalizeExclusionPaths(srcDirectory, exclusions));
  this.gulp.src(src)
            .pipe(this.gulp.dest(this.webappDestinationDirectory))
            .on('end', cb);
};

WebAppBuilder.prototype.copyStatic = function(exclusions, cb) {
  var srcDirectory = [this.sourceDirectory, 'static'].join(path.sep);
  var src = [[srcDirectory, '**', '*'].join(path.sep)];
  src = src.concat(normalizeExclusionPaths(srcDirectory, exclusions));
  this.gulp.src(src)
            .pipe(this.gulp.dest(this.webappDestinationDirectory))
            .on('end', cb);
};

module.exports = WebAppBuilder;
