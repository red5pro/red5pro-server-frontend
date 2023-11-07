'use strict'

var path = require('path')
var del = require('del')
var chalk = require('chalk')

var log = require([__dirname, 'log'].join(path.sep))
var buildWebapps = require([__dirname, 'build'].join(path.sep))
var menuBuilder = require([__dirname, 'menu-builder'].join(path.sep))
var moveWebapps = require([__dirname, 'move'].join(path.sep))
var frontEndBuilder = require([__dirname, 'frontend-builder'].join(path.sep))
var cleanWebapps = require([__dirname, 'clean'].join(path.sep))

var srcDirectory = [process.cwd(), 'src'].join(path.sep)
var libDirectory = [srcDirectory, 'lib'].join(path.sep)
var buildDirectory = [process.cwd(), 'dist'].join(path.sep)
var webappTaskDirectory = [process.cwd(), 'scripts', 'task', 'webapp'].join(
  path.sep
)
var buildFile = [webappTaskDirectory, 'build.template.js'].join(path.sep)

const TRUETIME_KEY = 'truetime'

module.exports = function (manifest) {
  const keys = Object.keys(manifest)
  let webapps = keys.map((key) => {
    if (key === TRUETIME_KEY) return undefined
    return Object.assign(manifest[key], {
      name: key,
      workspace: ['', 'tmp', key].join(path.sep),
    })
  })
  webapps = webapps.filter((w) => w !== undefined)

  // Include nested TrueTime webapps.
  if (keys.indexOf(TRUETIME_KEY) !== -1) {
    let ttapps = Object.keys(manifest.truetime).map((key) => {
      const conf = manifest.truetime[key]
      return {
        ...conf,
        name: key,
        workspace: ['', 'tmp', key].join(path.sep),
      }
    })
    webapps = webapps.concat(ttapps)
  }

  return {
    generate: function () {
      del.sync(buildDirectory, { force: true })
      buildWebapps
        .all(webapps)
        .then(function () {
          return menuBuilder.update(webapps)
        })
        .then(function () {
          return moveWebapps.all(webapps, srcDirectory, libDirectory)
        })
        .then(function () {
          return frontEndBuilder.addWebappsToBuild(
            webapps,
            buildFile,
            webappTaskDirectory
          )
        })
        .then(function () {
          return frontEndBuilder.generate(process.cwd(), buildDirectory)
        })
        .then(function () {
          return cleanWebapps.all(webapps)
        })
        .then(function () {
          log(chalk.blue('Build complete.'))
        })
        .catch(function (err) {
          log(chalk.red('Build failed: ' + err))
        })
    },
  }
}
