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

const { projectPath, packageDir } = process.env;
const packageName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icons/edit.png" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icons/check-circle-solid.png" },
  variables: {
    action: "sfdx:project:package:create:choosetype",
    projectPath,
    packageDir,
    packageName,
  },
};
const invalidPackageNameItem = {
  title: "Invalid Package Name",
  subtitle: "The Package Name may contain letter, numbers, '-' and '_'",
  icon: { path: "./icons/warning.png" },
  valid: false,
};
const packageNamePattern = /^[a-zA-Z\d-_]+$/;
const isPackageNameValid = packageNamePattern.test(packageName);

const items = !packageName
  ? [inputRequestItem]
  : isPackageNameValid
  ? [confirmItem]
  : [invalidPackageNameItem];

alfy.output(items);
