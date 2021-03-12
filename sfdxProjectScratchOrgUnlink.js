"use strict";

const alfy = require("alfy");

let projectPath = process.env.projectPath;

const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
alfy.config.delete(configKey);
