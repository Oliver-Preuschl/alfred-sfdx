/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const exec = require("child_process").exec;
const { getDateTime } = require("./lib/dateTimeFormatter.js");

const {
  projectPath,
  packageDir,
  packageName,
  packageType,
  isPackageOrgDependent,
} = process.env;

const formattedDateTime = getDateTime();

const orgDependencyArg = isPackageOrgDependent ? " --orgdependent" : "";

const command = `cd "${process.env.workspace}/${projectPath}"; sfdx force:package:create --name "${packageName}" --path "${packageDir}" --packagetype "${packageType}"${orgDependencyArg}`;
exec(command, function (error, stdout, stderr) {
  const action = !error
    ? "sfdx:status:largeType:success"
    : "sfdx:status:largeType:error";
  let message;
  if (!error) {
    message = `Successfully created package "${packageName}" (type "${packageType}", Org-Dependent: ${
      isPackageOrgDependent ? "Yes" : "No"
    }) for path "${
      process.env.workspace
    }/${projectPath}/${packageDir}"\n\n${stdout}`;
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
