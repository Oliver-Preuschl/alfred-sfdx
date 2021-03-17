"use strict";

const alfy = require("alfy");
const exec = require("child_process").exec;

const {
  relativeProjectPath,
  projectName,
  projectNamespace,
  projectTemplate,
} = process.env;

const projectNamespaceString = projectNamespace != null ? projectNamespace : "";

const command = `cd "${process.env.workspace}/${relativeProjectPath}"; sfdx force:project:create --projectname "${projectName}" --namespace "${projectNamespaceString}" --template "${projectTemplate}"`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    message = `Successfully created project "${projectName}" (namespace "${projectNamespaceString}") with template "${projectTemplate}" in "${process.env.workspace}/${relativeProjectPath}"\n\n${stdout}`;
  } else {
    message = `Error creating project\n\n${stdout}`;
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
