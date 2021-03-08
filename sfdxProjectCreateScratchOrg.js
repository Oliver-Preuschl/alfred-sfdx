"use strict";

const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");

const inputGroups = alfy.input.match(
  /(?:sfdx:project:createscratchorg)?\s+"(.*)"/
);
let scratchOrgDefinitionFile = inputGroups[1];

const pathParts = path.dirname(scratchOrgDefinitionFile).split(path.sep);
const projectPath = pathParts.slice(0, -1).join("/");
const folder = pathParts[pathParts.length - 2];
const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:org:create -a "${folder}" -f "${process.env.workspace}/${scratchOrgDefinitionFile}" --durationdays 30`;
try {
  const { stdout, stderr } = await exec(command);
  const scratchOrgGenerationResponseGroups = stdout.match(
    /Successfully created scratch org\s*:\s*(.*),\s*username\s*:\s*(.*)/
  );
  let orgId = scratchOrgGenerationResponseGroups[1];
  let username = scratchOrgGenerationResponseGroups[2];
  const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
  alfy.config.set(configKey, username);
  console.log(
    `Scratch Org successfully created. OrgId: ${orgId}, Username: ${username}`
  );
} catch (e) {
  console.log(`ERROR: ${e.message}`);
}
