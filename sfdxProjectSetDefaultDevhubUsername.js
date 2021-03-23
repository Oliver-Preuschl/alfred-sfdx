"use strict";

const exec = require("child_process").exec;

let { username, projectPath } = process.env;

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx config:set defaultdevhubusername="${username}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  const message = !error
    ? `Default Devhub Username was successfully set\n\n${stdout}`
    : `Error while setting Default Devhub Username\n\n${stderr}`;
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action,
          message,
        },
      },
    })
  );
});
