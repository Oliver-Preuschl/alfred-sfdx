"use strict";

const alfy = require("alfy");

const inputGroups = alfy.input.match(
  /(?:sfdx:project:assignscratchorg)?\s+"(.*)"\s+(\S*)/
);
let projectPath = inputGroups[1];
let userName = inputGroups[2];

const configKey = `sfdx:project:${projectPath}:assignedscratchorg`;
alfy.config.set(configKey, userName);
