"use strict";

const alfy = require("alfy");
const exec = require("child_process").exec;
const path = require("path");

let scratchOrgDefinitionFilePath = process.env.scratchOrgDefinitionFilePath;

const pathParts = path.dirname(scratchOrgDefinitionFilePath).split(path.sep);
const projectPath = pathParts.slice(0, -1).join("/");
const folder = pathParts[pathParts.length - 2];

const dateTime = new Date(Date.now());
const formattedDateTime = `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()}-${dateTime.getHours()}-${dateTime.getMinutes()}-${dateTime.getSeconds()}`;

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:org:create -a "${folder}" -f "${process.env.workspace}/${scratchOrgDefinitionFilePath}" --durationdays 30`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    const scratchOrgGenerationResponseGroups = stdout.match(
      /Successfully created scratch org\s*:\s*(.*),\s*username\s*:\s*(.*)/
    );
    const orgId = scratchOrgGenerationResponseGroups[1];
    const username = scratchOrgGenerationResponseGroups[2];
    message = `Success\n\n${stdout}`;
    const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
    alfy.config.set(configKey, username);
  } else {
    message = `Error while creating org\n\n${stdout}`;
  }
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action,
          message,
          formattedDateTime,
        },
      },
    })
  );
});
