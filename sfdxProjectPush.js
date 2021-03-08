"use strict";

const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(?:sfdx:project:push)?\s+"(.*)"\s+(\S*)/);
let projectPath = inputGroups[1];
let username = inputGroups[2];

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:source:push --targetusername "${username}"`;
try {
  const { stdout, stderr } = await exec(command);
  alfy.output([
    {
      title: `Source successfully pushed`,
      subtitle: `Username: ${username}`,
      icon: { path: "./icn/check-circle-o.icns" },
      arg: "sfdx",
    },
  ]);
} catch (e) {
  alfy.error(`ERROR: ${e.message}`);
}
