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

const { projectPath, packageId } = process.env;
const password = alfy.input;

const inputRequestItem = {
  title: "Please enter Password",
  subtitle: "Leave blank for no password",
  icon: { path: "./icons/edit.png" },
  valid: true,
  variables: {
    action: "sfdx:project:package:create:version",
    projectPath,
    packageId,
    password,
  },
};

alfy.output([inputRequestItem]);
