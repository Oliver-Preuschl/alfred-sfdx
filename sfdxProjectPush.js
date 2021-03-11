"use strict";

const alfy = require("alfy");
const exec = require("child_process").exec;
const { getDateTime } = require("./lib/dateTimeFormatter.js");

let projectPath = process.env.projectPath;
let username = process.env.username;

const formattedDateTime = getDateTime();

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:source:push --targetusername "${username}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  const message = !error
    ? `Source successfully pushed to ${username}\n\n${stdout}`
    : `Error while pushing source to ${username}\n\n${stdout}`;
  const logFileName = !error
    ? `${formattedDateTime}_success_source-push.log`
    : `${formattedDateTime}_error_source-push.log`;
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action,
          message,
          logFileName,
        },
      },
    })
  );
});
