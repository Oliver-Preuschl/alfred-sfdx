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
const { getScratchOrgDefinitionFiles } = require("./lib/fileSearcher.js");

let projectPath = process.env.projectPath;
let searchTerm = alfy.input;

const pathItem = getPathItem(["Org (Scratch)", "Create"], {
  description: "Please choose org definition",
  hideHomeLink: true,
});

const scratchOrgDefinitionFiles = getScratchOrgDefinitionFiles(
  projectPath + "/config"
);
const scratchOrgDefinitionItems = await buildScratchOrgDefinitionItems(
  scratchOrgDefinitionFiles
);
alfy.output([
  pathItem,
  ...alfy.matches(searchTerm, scratchOrgDefinitionItems, "title"),
]);

async function buildScratchOrgDefinitionItems(scratchOrgDefinitionFiles) {
  return scratchOrgDefinitionFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.file,
      subtitle: `...${sfdxProjectFile.relativeDirPath}`,
      icon: { path: "./icons/file-solid.png" },
      variables: {
        action: "sfdx:project:scratchorg:create",
        scratchOrgDefinitionFilePath: `${sfdxProjectFile.relativeDirPath}/${sfdxProjectFile.file}`,
      },
      mods: {
        ctrl: {
          subtitle: `...${sfdxProjectFile.relativeDirPath}`,
        },
        alt: {
          subtitle: `...${sfdxProjectFile.relativeDirPath}`,
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}
