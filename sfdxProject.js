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
const { getProjects } = require("./lib/sfdxDataLoader.js");

const searchTerm = alfy.input;

const pathItem = getPathItem(["Projects"]);
if (!!process.env.workspace) {
  const projects = await getProjects();
  const addProjectItem = getAddProjectItem();
  const projectPathItems = alfy.matches(
    searchTerm,
    getProjectItems(projects),
    "title"
  );
  alfy.output([pathItem, addProjectItem, ...projectPathItems]);
} else {
  alfy.output([pathItem, getWorkspaceNotSetWarningItem()]);
}

function getAddProjectItem() {
  return {
    title: "Add Project",
    icon: { path: "./icons/plus-circle-solid-green.png" },
    arg: "",
    variables: {
      action: "sfdx:project:add:choosefolder",
    },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  };
}

function getProjectItems(projects) {
  return projects
    .map((project) => ({
      title: project.dir,
      subtitle: `...${project.path}`,
      icon: { path: "./icons/folder-solid-green.png" },
      arg: "",
      variables: {
        action: "sfdx:project:details",
        projectPath: project.path,
      },
      path: project.path,
      mods: {
        ctrl: {
          subtitle: `OPEN "...${project.path}/sfdx-project.json"`,
          icon: { path: "./icons/eye-solid-green.png" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: `${project.path}/sfdx-project.json`,
          },
        },
        alt: {
          subtitle: `OPEN "...${project.path}"`,
          icon: { path: "./icons/eye-solid-green.png" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: project.path,
          },
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

function getWorkspaceNotSetWarningItem() {
  return {
    title: "Workspace not set",
    subtitle:
      "Please set a workspace directory in order to get access to this feature",
    icon: { path: "./icons/warning.png" },
    valid: false,
  };
}
