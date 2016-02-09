module.exports = {
  default: {
    workspace: '/tmp/red5pro-server-frontend',
    dirToCopy: '/tmp/red5pro-server-frontend/dist/webapps',
    deployTo: '/opt/local/webapps',
    repositoryUrl: 'git@github.com:red5pro/red5pro-server-frontend.git',
    ignores: [
      '.git',
      '.gitignore',
      'auto-deploy-config.custom.js',
      'auto-deploy-config.js',
      'package.json',
      'README.md',
      'shipitfile.js',
      'node_modules/'
    ],
    keepReleases: 2,
    deleteOnRollback: false,
    shallowClone: true
  },
  feature: {
    branch: '#target_feature_branch#',
    servers: [
      '#target_deployment_server#'
    ]
  },
  staging: {
    branch: 'qa',
    servers: [
      '#target_deployment_server#',
    ]
  },
  production: {
    branch: 'master',
    servers: [
      '#target_deployment_server#'
    ]
  }
}
