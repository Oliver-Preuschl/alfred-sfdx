"use strict";

const alfy = require("alfy");

const inputGroups = alfy.input.match(
  /(?:sfdx:project:unlinkscratchorg)?\s+"(.*)"/
);
let projectPath = inputGroups[1];

const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
alfy.config.delete(configKey);
