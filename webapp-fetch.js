var path = require('path');
var del = require('del');
var mkdir = require('mkdirp');
var chalk = require('chalk');
var exec = require('child_process').exec;
var Promise = require('bluebird');

var config = require([process.cwd(), 'webapps.json'].join(path.sep));
var keys = Object.keys(config);
var webapps = keys.map(function(key) {
  return Object.assign(config[key], {name: key});
});
var log = console.log.bind(console);

var init = function(options) {
  log(chalk.white('Initializing new webapp build for ' + options.name + '...'));
  return new Promise(function(resolve, reject) {
    var child = exec('git init', options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var addRemote = function(options) {
  log(chalk.white('Setting up new webapp build for ' + options.name + ' from ' + options.repositoryUrl + '...'));
  return new Promise(function(resolve, reject) {
    var child = exec(['git remote add', options.name, options.repositoryUrl].join(' '), options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var fetch = function(options) {
  log(chalk.yellow('Fetching ' + options.name + '...'));
  return new Promise(function(resolve, reject) {
    var child = exec(['git fetch', options.name].join(' '), options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var checkout = function(options) {
  log(chalk.yellow('Checking out branch ' + options.branch + '...'));
  return new Promise(function(resolve, reject) {
    var child = exec('git checkout ' + options.branch, options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var buildWebapp = function(options) {
  const command = chalk.red([options.cwd, options.cmd].join('/'));
  log(
    chalk.yellow('Building ' + options.name + ' using ' + command + '...')
  );
  return new Promise(function(resolve, reject) {
    var child = exec(options.cmd, options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

var moveWebapp = function(options) {
  const outDir = chalk.red(options.out);
  const toDir = chalk.red(options.toDir);
  log(
    chalk.white('Moving ' + outDir + ' to ' + toDir + '...')
  )
  return new Promise(function(resolve, reject) {
    del.sync(options.toDir, {force: true});
    var child = exec(['mv', options.out, options.toDir].join(' '), options, function(err) {
      if(err) {
        reject(err);
      }
      else {
        resolve({
          child: child
        });
      }
    });
    child.stdout.pipe(process.stdout);
  });
};

webapps.forEach(function(config) {

  del.sync(config.workspace, {force: true});
  mkdir.sync(config.workspace);

  init({
    cwd: config.workspace
  })
  .then(function(res) {
    return addRemote({
      cwd: config.workspace,
      name: config.name,
      repositoryUrl: config.repositoryUrl
    });
  })
  .then(function(res) {
    return fetch({
      cwd: config.workspace,
      name: config.name
    });
  })
  .then(function(res) {
    return checkout({
      branch: config.branch,
      cwd: config.workspace,
      name: config.name
    });
  })
  .then(function() {
    return buildWebapp({
      cwd: config.workspace,
      name: config.name,
      cmd: config.buildCommand
    });
  })
  .then(function() {
    return moveWebapp({
      cwd: config.workspace,
      name: config.name,
      out: config.webappDir,
      toDir: [process.cwd(), 'src', 'webapps', config.name].join(path.sep)
    });
  })
  .catch(function(e) {
    console.error('Error: ' + e);
  });

});
console.log(chalk.gray('WebApps:\n' + JSON.stringify(webapps, null, 2)));
