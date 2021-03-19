"use strict";

const exec = require("child_process").exec;
const { getDateTime } = require("./lib/dateTimeFormatter.js");

const { projectPath, packageId, password } = process.env;

const formattedDateTime = getDateTime();

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:package:version:create --package "${packageId}" --installationkey "${password}" --codecoverage --wait ${process.env.packageVersionWaitTime}`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    message = `Successfully created package version for package "${packageId}" from path "${process.env.workspace}/${projectPath}"\n\n${stdout}`;
  } else {
    message = `Error creating package version\n\n${stderr}`;
  }
  const logFileName = !error
    ? `${formattedDateTime}_success_packageversion-create.log`
    : `${formattedDateTime}_error_packageversion-create.log`;
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
