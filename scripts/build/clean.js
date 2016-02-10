'use strict';

var path = require('path');
var chalk = require('chalk');
var del = require('del');
var Promise = require('bluebird');

var log = require([__dirname, 'log'].join(path.sep));

var webapp = function(config) {
  log(chalk.yellow('Cleaning build of ' + config.workspace + '...'));
  return new Promise(function(resolve, reject) {
    try {
      del.sync(config.workspace, {force: true});
      resolve();
    }
    catch(e) {
      reject(e);
    }
  });
};

var all = function(webapps) {
  return Promise.each(webapps, function(config) {
    return webapp(config);
  });
};

module.exports = {
  webapp: webapp,
  all: all
};
