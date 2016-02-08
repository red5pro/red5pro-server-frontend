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
var distDirectory = [process.cwd(), 'dist'].join(path.sep);

var init = function(options) {
  return new Promise(function(resolve, reject) {
    log(chalk.white('Initializing new webapp build for ' + options.name + '...'));
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
  return new Promise(function(resolve, reject) {
    log(chalk.white('Setting up new webapp build for ' + options.name + ' from ' + options.repositoryUrl + '...'));
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
  return new Promise(function(resolve, reject) {
    log(chalk.yellow('Fetching ' + options.name + '...'));
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
  return new Promise(function(resolve, reject) {
    log(chalk.yellow('Checking out branch ' + options.branch + '...'));
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
  return new Promise(function(resolve, reject) {
    if(options.cmd) {
      const command = chalk.magenta([options.cwd, options.cmd].join('/'));
      log(
        chalk.yellow('Building ' + options.name + ' using ' + command + '...')
      );
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
    }
    else {
      resolve();
    }
  });
};

var moveWebapp = function(options) {
  return new Promise(function(resolve, reject) {
    const outDir = chalk.magenta(options.out);
    const toDir = chalk.magenta(options.toDir);
    log(
      chalk.white('Moving ' + outDir + ' to ' + toDir + '...')
    );
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

var generate = function() {
  webapps.forEach(function(config) {

    console.log(chalk.blue('Generating WebApp with config:\n' + JSON.stringify(config, null, 2))); 
    del.sync(config.workspace, {force: true});
    mkdir.sync(config.workspace);

    init({
      cwd: config.workspace,
      name: config.name
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
        toDir: [distDirectory, 'webapps', config.name].join(path.sep)
      });
    })
    .then(function() {
      log(chalk.blue('Build complete for ' + config.name + '.'));
    })
    .catch(function(e) {
      log(chalk.red('Error: ' + e));
    });

  });
};

var child = exec('npm run build', {cwd:process.cwd()}, function(err) {
  if(err) {
    log(chalk.red('Error in building: ' + err));
  }
  else {
    generate();
  }
});
child.stdout.pipe(process.stdout);
