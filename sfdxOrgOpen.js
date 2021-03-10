"use strict";

const util = require("util");
const exec = util.promisify(require("child_process").exec);

let username = process.env.username;

const { stdout, stderr } = await exec(
  `cd  alfred-sfdx; sfdx force:org:open --targetusername=${username}`
);
