const alfy = require("alfy");

alfy.log("test");

const inputGroups = alfy.input.match(
  /(?:sfdx:package:config:setpath)?\s+(\S*)\s+(.*)/
);
let packageId = inputGroups[1];
let pathToSet = inputGroups[2];

const configKey = `sfdx:package:${packageId}:config:path`;
alfy.log(packageId);
alfy.log(pathToSet);
alfy.config.set(configKey, pathToSet);
