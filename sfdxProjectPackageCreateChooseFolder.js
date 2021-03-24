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
const { getPotentialPackageDirs } = require("./lib/fileSearcher.js");

const { projectPath } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Please choose Package Folder",
  hideHomeLink: true,
});

const potentialPackageDirs = getPotentialPackageDirs(projectPath, projectPath);

const workspacePathItems = alfy.matches(
  searchTerm,
  await getPackageDirItems(potentialPackageDirs),
  "title"
);
alfy.output([pathItem, ...workspacePathItems]);

function getPackageDirItems(potentialPackageDirs, projectPath) {
  return potentialPackageDirs.map((potentialPackageDir) => ({
    title: potentialPackageDir,
    subtitle: "",
    icon: { path: "./icons/folder-solid.png" },
    arg: "",
    variables: {
      action: "sfdx:project:package:create:entername",
      projectPath,
      packageDir: potentialPackageDir,
    },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  }));
}
