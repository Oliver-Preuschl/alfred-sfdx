"use strict";

const alfy = require("alfy");
const exec = require("child_process").exec;

let projectPath = process.env.projectPath;
let username = process.env.username;

const dateTime = new Date(Date.now());
const formattedDateTime = `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()}-${dateTime.getHours()}-${dateTime.getMinutes()}-${dateTime.getSeconds()}`;

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:source:push --targetusername "${username}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  const message = !error
    ? `Source successfully pushed to ${username}\n\n${stdout}`
    : `Error while pushing source to ${username}\n\n${stdout}`;
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
