'use strict'
var path = require('path')
var builder = require([process.cwd(), 'scripts', 'build', 'webapps'].join(
  path.sep
))
var manifest = require([process.cwd(), 'webapps.json'].join(path.sep))
builder(manifest).generate()
