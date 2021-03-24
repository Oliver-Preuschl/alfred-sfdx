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
