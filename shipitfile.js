module.exports = function (shipit) {

  require('shipit-deploy')(shipit)

  var chalk = require('chalk')

  function merge (a, b, z) {
    for (var prop in b) {
      try {
        if (b[prop].constructor === Object) {
          a[prop] = merge(a[prop], b[prop], z + '  ')
        } else {
          a[prop] = b[prop]
        }
      } catch (e) {
        a[prop] = b[prop]
      }
    }

    return a
  }

  //  Recursively merge configuration files
  var config = [
      './auto-deploy-config.js'
      ,'./auto-deploy-config.custom.js'
      // ,'./dummy.js'
    ]
    .map(function (cfg) {
      try {
        return require(cfg)
      } catch (e) {
        shipit.log(chalk.red('!! Could not find configuration file: ' + cfg))
        return {}
      }
    })
    .reduce(function (prevConfig, cfg) {
      return merge(prevConfig, cfg)
    }, {})

  /*
  ### Options
  | Option            | Type            | Description |
  |:------------------|:----------------|:------------|
  | workspace         | String          | Empty directory path to use as local side of transfer |
  | dirToCopy         | String          | Defaults to `workspace` |
  | deployTo          | String          | Remote directory to deploy to. Contains `releases` and symlink to `current` |
  | repositoryUrl     | String          | Git URL of repo |
  | branch            | String          | Tag, commit, or branch to deploy |
  | ignores           | Array<String>   | Array of paths to ignore |
  | deleteOnRollback  | Boolean         | Delete old releases on rollback to previous release |
  | keepReleases      | Number          | Number of releases to keep |
  | shallowClone      | Boolean         | Perform a shallow clone. Default: false |
  | gitLogFormat      | String          | Git log format for `pending` task. Default: %h: %s - %an |
  | servers           | String or Array<String> | The server(s) to deploy to. Format as user@server.com. Default user is `deploy` |
  | key               | String          | Path to the SSH key required for the server(s) |

  For more information, see [shipit-deploy](https://github.com/shipitjs/shipit-deploy) and [shipit](https://github.com/shipitjs/shipit).
  */

  shipit.initConfig(config)

  shipit.task('config', function () {
    return shipit.log(JSON.stringify(config, null, '\t'))
  })

  shipit.task('buildAndDeploy', function () {
    shipit.local('node webapp-fetch.js', {cwd: process.cwd()})
      .then(function() {
        return shipit.local('rm -rf ' + config.default.workspace, {cwd: process.cwd()});
      })
      .then(function() {
        return shipit.local('cp -r ' + process.cwd() + ' ' + config.default.workspace, {cwd: process.cwd()});
      })
      .then(function() {
        shipit.start('deploy:init', 'deploy:update', 'deploy:publish', 'deploy:clean', 'deploy:finish')
      });
  })
}
