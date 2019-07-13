"use strict";

var MyConfigStore = require("configstore");
var pkg = require("../package.json");

// Init a Configstore instance with an unique ID eg. package name
// and optionally some default values
module.exports = new MyConfigStore(pkg.name, {});