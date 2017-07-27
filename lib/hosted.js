'use strict';

const HDDevice = require('./hd4/device');
const fs = require('fs');

module.exports = function( requestOptions, onlyLoad, free ) {
  requestOptions;
  onlyLoad;
  const dbFile = `${ __dirname }/${ free? 'community': '' }database.json`;
  let tree = {};
  if (fs.existsSync(dbFile)) {
    const buffer = fs.readFileSync(dbFile);
    tree = JSON.parse( buffer );
  } else {
    console.log(`${dbFile} not found. Must download.`);
  }
  const device = new HDDevice(tree);
  const CACHE = {};
  return function parse(input) {
    if (typeof input === 'string') {
      input = {'user-agent': input};
    }
    const inputKey = JSON.stringify(input).toLowerCase();
    if (CACHE[inputKey] !== undefined) {
      return CACHE[inputKey];
    }
    const result = device.localDetect(input);
    if (!result) {
      return undefined;
    }
    const reply = device.reply;
    const hdSpecs = reply.hd_specs;
    reply.aliases = hdSpecs.general_aliases;
    reply.browser = hdSpecs.general_browser;
    reply.browserVersion = hdSpecs.general_browser_version;
    reply.model = hdSpecs.general_model;
    reply.platform = hdSpecs.general_platform;
    reply.platformVersion = hdSpecs.general_platform_version;
    reply.type = hdSpecs.general_type;
    reply.vendor = hdSpecs.general_vendor;
    CACHE[inputKey] = reply;
    return reply;
  };
};
