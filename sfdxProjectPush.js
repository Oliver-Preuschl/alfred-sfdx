"use strict";

const alfy = require("alfy");

const inputGroups = alfy.input.match(/(?:sfdx:project:push)?\s+"(.*)"\s+(\S*)/);
let projectPath = inputGroups[1];
let username = inputGroups[2];

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:source:push -targetusername "${username}"`;
try {
  const { stdout, stderr } = await exec(command);
  const scratchOrgGenerationResponseGroups = stdout.match(
    /Successfully created scratch org\s*:\s*(.*),\s*username\s*:\s*(.*)/
  );
  let username = scratchOrgGenerationResponseGroups[2];
  const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
  alfy.config.set(configKey, username);
} catch (e) {
  alfy.output(`ERROR:${e.message}`);
  //throw new Error(`ERROR:${e.message}`);
}