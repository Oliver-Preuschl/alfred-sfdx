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

const { relativeProjectPath } = process.env;
const projectName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icons/edit.png" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icons/check-circle-solid.png" },
  variables: {
    action: "sfdx:project:add:enternamespace",
    relativeProjectPath,
    projectName,
  },
};
const invalidProjectNameItem = {
  title: "Invalid Project Name",
  subtitle: "The Project Name may contain letter, numbers, '-' and '_'",
  icon: { path: "./icons/warning.png" },
  valid: false,
};
const projectNamePattern = /^[a-zA-Z\d-_]+$/;
const isProjectNameValid = projectNamePattern.test(projectName);

const items = !projectName
  ? [inputRequestItem]
  : isProjectNameValid
  ? [confirmItem]
  : [invalidProjectNameItem];

alfy.output(items);
