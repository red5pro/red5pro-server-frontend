'use strict'
var path = require('path')
var chalk = require('chalk')
var Promise = require('bluebird')

var log = require([__dirname, 'log'].join(path.sep))
var webappOps = require([__dirname, 'webapp-ops'].join(path.sep))

var webapp = function (config) {
  log(
    chalk.blue(
      'Generating webapp with config: \n' + JSON.stringify(config, null, 2)
    )
  )
  return webappOps
    .clean(config)
    .then(function () {
      return webappOps.init({
        cwd: config.workspace,
        name: config.name,
      })
    })
    .then(function () {
      return webappOps.addRemote({
        cwd: config.workspace,
        name: config.name,
        repositoryUrl: config.repositoryUrl,
      })
    })
    .then(function () {
      return webappOps.fetch({
        cwd: config.workspace,
        name: config.name,
      })
    })
    .then(function () {
      return webappOps.checkout({
        branch: config.branch,
        cwd: config.workspace,
        name: config.name,
      })
    })
    .then(function (res) {
      const { config: configObjectOrArray } = res
      const configArray = Array.isArray(configObjectOrArray)
      if (configArray) {
        log(
          chalk.blue(
            'Found multiple configurations for ' +
              config.name +
              '.' +
              JSON.stringify(configObjectOrArray, null, 2)
          )
        )
        const configs = configObjectOrArray.map((c) => {
          const newConfig = { ...config, ...c }
          log(
            chalk.blue(
              'Updated Child configuration: ' +
                JSON.stringify(newConfig, null, 2)
            )
          )
          return newConfig
        })
        config = Object.assign(config, { children: configs })
        log(
          chalk.blue(
            'Updated configuration: ' + JSON.stringify(config, null, 2)
          )
        )
        return Promise.each(configs, (c) => {
          return webappOps.buildWebapp({
            cwd: c.workspace,
            name: c.name,
            cmd: c.buildCommand,
            outDir: c.webappOutput,
          })
        })
      }
      config = Object.assign(config, res.config)
      log(
        chalk.blue('Updated configuration: ' + JSON.stringify(config, null, 2))
      )
      return webappOps.buildWebapp({
        cwd: config.workspace,
        name: config.name,
        cmd: config.buildCommand,
        outDir: config.webappOutput,
      })
    })
    .then(function () {
      log(chalk.blue('Moving optional lib dependencies...'))
      return webappOps.addLibs({
        cwd: config.workspace,
        libDir: config.libOutput || undefined,
        outLibDir: [config.webappOutput, 'lib'].join(path.sep),
      })
    })
}

var all = function (webapps) {
  return Promise.each(webapps, function (config) {
    return webapp(config)
  })
}

module.exports = {
  webapp: webapp,
  all: all,
}
