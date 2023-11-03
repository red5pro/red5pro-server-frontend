'use strict'

var path = require('path')
var chalk = require('chalk')
var fileReplace = require('replace')
var Promise = require('bluebird')

var log = require([__dirname, 'log'].join(path.sep))
var menuListItemTemplate =
  '<li><a class="menu-listing-internal" href="/$webappName">$title</a></li>'
var insertLineRegex = '<!-- webapps -->'
const ttMenuListItemTemplate =
  '<li><a class="menu-listing-nested" href="/truetime/$webappName">$title&nbsp;<img decoding="async" loading="lazy" src="images/white-arrow.svg" data-src="" alt="" width="12" height="12"></a></li>'
const insertTrueTimeRegex = '<!-- truetime apps -->'

var updateMenuListing = function (regex, menuListItems) {
  log(chalk.yellow('Updating menu listing.'))
  return new Promise(function (resolve, reject) {
    try {
      fileReplace({
        regex,
        replacement: menuListItems.join(''),
        paths: [
          [process.cwd(), 'src', 'template', 'partial', 'menu.hbs'].join(
            path.sep
          ),
        ],
        recursive: false,
        silent: false,
      })
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  update: async (webapps) => {
    const folded = webapps.map((config) => {
      return config.children ? config.children : config
    })
    const flattened = folded.flat()
    const items = flattened.filter(
      (config) => config.title && config.title.length > 0
    )
    const menu = items.filter((config) => !config.parent)
    const trueTimeMenu = items.filter(
      (config) => config.parent && config.parent === 'truetime'
    )
    const trueTimeMenuListing = trueTimeMenu.map((config) => {
      return ttMenuListItemTemplate
        .replace('$webappName', config.webappName)
        .replace('$title', config.title)
    })
    const menuListing = menu.map((config) => {
      return menuListItemTemplate
        .replace('$webappName', config.webappName)
        .replace('$title', config.title)
    })
    await updateMenuListing(insertLineRegex, menuListing)
    await updateMenuListing(insertTrueTimeRegex, trueTimeMenuListing)
    return true
  },
}
