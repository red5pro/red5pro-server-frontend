'use strict'

var path = require('path')
var del = require('del')
var chalk = require('chalk')
var exec = require('child_process').exec
var Promise = require('bluebird')

var log = require([__dirname, 'log'].join(path.sep))

var move = function (options) {
  return new Promise(function (resolve, reject) {
    console.log('Moving Conf', JSON.stringify(options, null, 2))
    var outDir = chalk.magenta(options.outDir)
    var toDir = chalk.magenta(options.toDir)
    log(chalk.white('Moving ' + outDir + ' to ' + toDir + '...'))
    var child = exec(
      ['mv', options.outDir, options.toDir].join(' '),
      options,
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({
            child: child,
          })
        }
      }
    )
    child.stdout.pipe(process.stdout)
  })
}

var webapp = function (config, srcDirectory, libDirectory) {
  console.log('Incoming Conf', JSON.stringify(config, null, 2))
  const parentDir = config.parent || undefined
  const webappPath = parentDir
    ? [parentDir, config.webappName].join(path.sep)
    : config.webappName
  var toDir = [srcDirectory, 'webapps', webappPath].join(path.sep)
  log(chalk.yellow('Removing previous webapp build at ' + toDir + '...'))
  del.sync(toDir, { force: true })
  return move({
    cwd: config.workspace,
    name: config.name,
    outDir: config.webappOutput || config.webappName,
    toDir: toDir,
    toLibDir: libDirectory,
  })
}

var all = function (webapps, srcDirectory) {
  log(chalk.yellow('Moving built webapps...'))
  return Promise.each(webapps, function (config) {
    const children = config.children || undefined
    if (children) {
      return Promise.each(children, (c) => {
        return webapp(c, srcDirectory)
      })
    } else {
      return webapp(config, srcDirectory)
    }
  })
}

module.exports = {
  webapp: webapp,
  all: all,
}
