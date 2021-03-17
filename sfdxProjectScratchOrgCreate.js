"use strict";

const alfy = require("alfy");
const exec = require("child_process").exec;
const path = require("path");
const { getDateTime } = require("./lib/dateTimeFormatter.js");

let scratchOrgDefinitionFilePath = process.env.scratchOrgDefinitionFilePath;

const pathParts = path.dirname(scratchOrgDefinitionFilePath).split(path.sep);
const projectDirPath = pathParts.slice(0, -1).join("/");
const projectDir = pathParts[pathParts.length - 2];

const formattedDateTime = getDateTime();

const command = `cd "${process.env.workspace}/${projectDirPath}"; sfdx force:org:create -a "${projectDir}" -f "${process.env.workspace}/${scratchOrgDefinitionFilePath}" --setdefaultusername --durationdays 30`;
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
    const configKey = `sfdx:project:${projectDirPath}:linkedscratchorg`;
    alfy.config.set(configKey, username);
  } else {
    message = `Error while creating org\n\n${stdout}`;
  }
  const logFileName = !error
    ? `${formattedDateTime}_success_org-create.log`
    : `${formattedDateTime}_error_org-create.log`;
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action,
          message,
          projectPath: projectDirPath,
          logFileName,
        },
      },
    })
  );
});
