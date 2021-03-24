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
const { getWorkspacePaths } = require("./lib/sfdxDataLoader.js");

const searchTerm = alfy.input;

const sfdxWorkspacePaths = await getWorkspacePaths();

const pathItem = getPathItem(["Projects", "Add"], {
  description: "Please choose Folder",
  hideHomeLink: true,
});
const workspacePathItems = alfy.matches(
  searchTerm,
  getAvailableWorkspacePathItems(sfdxWorkspacePaths),
  "title"
);
alfy.output([pathItem, ...workspacePathItems]);

function getAvailableWorkspacePathItems(sfdxWorkspacePaths) {
  return sfdxWorkspacePaths.map((workspaceDir) => ({
    title: workspaceDir.relativePath,
    subtitle: `${workspaceDir.path}`,
    icon: { path: "./icons/folder-solid.png" },
    arg: "",
    variables: {
      action: "sfdx:project:add:entername",
      relativeProjectPath: workspaceDir.relativePath,
    },
    mods: {
      ctrl: {
        subtitle: `${workspaceDir.path}`,
      },
      alt: {
        subtitle: `${workspaceDir.path}`,
      },
    },
  }));
}
