"use strict";

const exec = require("child_process").exec;
const { getDateTime } = require("./lib/dateTimeFormatter.js");

const { projectPath, packageDir, packageName, packageType } = process.env;

const formattedDateTime = getDateTime();

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:package:create --name "${packageName}" --path "${packageDir}" --packagetype "${packageType}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    message = `Successfully created package "${packageName}" (type "${packageType}") for path "${process.env.workspace}/${projectPath}/${packageDir}}"\n\n${stdout}`;
  } else {
    message = `Error creating package\n\n${stderr}`;
  }
  const logFileName = !error
    ? `${formattedDateTime}_success_package-create.log`
    : `${formattedDateTime}_error_package-create.log`;
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action,
          message,
          error,
          stdout,
          stderr,
          projectPath,
          logFileName,
        },
      },
    })
  );
});
