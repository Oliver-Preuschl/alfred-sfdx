"use strict";

const alfy = require("alfy");

let projectPath = process.env.projectPath;
let username = process.env.username;

const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
alfy.config.set(configKey, username);
