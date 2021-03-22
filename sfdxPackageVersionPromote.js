"use strict";

const exec = require("child_process").exec;

const { packageVersionId } = process.env;

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:package:version:promote --package "${packageVersionId}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    message = `Successfully promoted package version "${packageVersionId}"\n\n${stdout}`;
  } else {
    message = `Error creating package\n\n${stderr}`;
  }
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
        },
      },
    })
  );
});
