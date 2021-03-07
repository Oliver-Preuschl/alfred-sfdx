"use strict";

const alfy = require("alfy");

const inputGroups = alfy.input.match(
  /(?:sfdx:project:linkscratchorg)?\s+"(.*)"\s+(\S*)/
);
let projectPath = inputGroups[1];
let userName = inputGroups[2];

const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
alfy.config.set(configKey, userName);
