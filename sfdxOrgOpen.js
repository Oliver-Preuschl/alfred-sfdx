"use strict";

const exec = require("child_process").exec;

let username = process.env.username;

const command = `cd  alfred-sfdx; sfdx force:org:open --targetusername=${username}`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  if (error) {
    let message = `Error while opening org\n\n${stdout}`;
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
  }
});
