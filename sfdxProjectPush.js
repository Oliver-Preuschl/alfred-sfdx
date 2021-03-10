"use strict";

const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

let projectPath = process.env.projectPath;
let username = process.env.projectPath;

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:source:push --targetusername "${username}"`;
try {
  const { stdout, stderr } = await exec(command);
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action: "sfdx:status:largeType:success",
          message: `Source successfully pushed to ${username}`,
        },
      },
    })
  );
} catch (e) {
  console.log(
    JSON.stringify({
      alfredworkflow: {
        arg: "",
        variables: {
          action: "sfdx:status:largeType:error",
          message: `Error while pushing source to ${username}: ${e.message}`,
        },
      },
    })
  );
}
