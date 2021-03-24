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
const { getPathItem } = require("./lib/pathItemCreator.js");

const { projectPath, packageDir, packageName, packageType } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Should the package be Org dependent?",
  hideHomeLink: true,
});

const packageOrgDependencyItems = [
  {
    title: "Yes",
    variables: {
      action: "sfdx:project:package:create",
      projectPath,
      packageDir,
      packageName,
      packageType,
      isPackageOrgDependent: true,
    },
  },
  {
    title: "No",
    variables: {
      action: "sfdx:project:package:create",
      projectPath,
      packageDir,
      packageName,
      packageType,
      isPackageOrgDependent: false,
    },
  },
];

const filteredPackageOrgDependencyItems = alfy.matches(
  searchTerm,
  packageOrgDependencyItems,
  "title"
);

alfy.output([pathItem, ...filteredPackageOrgDependencyItems]);
