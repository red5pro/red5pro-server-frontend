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
      'ec2-user@ec2-54-174-142-30.compute-1.amazonaws.com'
    ]
  },
  staging: {
    branch: 'qa',
    servers: [
      'ec2-user@ec2-54-174-142-30.compute-1.amazonaws.com',
    ]
  },
  production: {
    branch: 'master',
    servers: [
      'ec2-user@ec2-54-174-142-30.compute-1.amazonaws.com'
    ]
  }
}
