var path = require('path');
var del = require('del');
var mkdir = require('mkdirp');
var exec = require('child_process').exec;
var Promise = require('bluebird');

var config = require([process.cwd(), 'webapps.json'].join(path.sep));
var keys = Object.keys(config);
var webapps = keys.map(function(key) {
  return Object.assign(config[key], {name: key});
});

var init = function(options) {
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
  });
};

var addRemote = function(options) {
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
  });
};

var fetch = function(options) {
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
  });
};

var checkout = function(options) {
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
  });
};

var buildWebapp = function(options) {
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
  });
};

var moveWebapp = function(options) {
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
      cwd: config.workspace
    });
  })
  .then(function() {
    return buildWebapp({
      cwd: config.workspace,
      cmd: config.buildCommand
    });
  })
  .then(function() {
    return moveWebapp({
      cwd: config.workspace,
      out: config.webappDir,
      toDir: [process.cwd(), 'src', 'webapps', config.name].join(path.sep)
    });
  })
  .catch(function(e) {
    console.error('Error: ' + e);
  });

});

console.log(webapps);
