// ===========================================
// Waste Walking
// Licensed under MIT
// ===========================================

const semver = require("semver");

if (!semver.satisfies(process.version, ">=10.12")) {
  WW.logger.error("Node.js 10.12.x or later required!");
  throw new Error("Node.js 10.12.x or later required!");
}

let WW = {
  ROOTPATH: process.cwd(),
  Error: require('./helpers/error'),
  configurationSvc: require('./system/configuration'),
  system: require('./system')
}

global.WW = WW

WW.configurationSvc.init()
WW.logger = require('./system/logger').init()

WW.system.init()