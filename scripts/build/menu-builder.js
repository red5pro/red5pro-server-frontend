'use strict';

var path = require('path');
var chalk = require('chalk');
var fileReplace = require('replace');
var Promise = require('bluebird');

var log = require([__dirname, 'log'].join(path.sep));
var menuListItemTemplate = '<li><a class="red-text menu-listing-internal" href="/$webappName">$title</a></li>';
var insertLineRegex = '<!-- webapps -->';

var updateMenuListing = function(menuListItems) {
  log(chalk.yellow('Updating menu listing.'));
  return new Promise(function(resolve, reject) {
    try {
        fileReplace({
          regex: insertLineRegex,
          replacement: menuListItems.join(''),
          paths: [[process.cwd(), 'src', 'template', 'partial', 'menu.hbs'].join(path.sep)],
          recursive: false,
          silent: false
        });
        resolve();
      }
      catch(e) {
        reject(e)
      }
  });
};

module.exports = {
  update: function(webapps) {
    var items = webapps.filter(function (config) { return config.title.length > 0 });
    var menuListing = items.map(function(config) {
      return menuListItemTemplate
              .replace('$webappName', config.webappName)
              .replace('$title', config.title)
    });
    return updateMenuListing(menuListing);
  }
};
