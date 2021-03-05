"use strict";

const alfy = require("alfy");
const util = require("util");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getScratchOrgDefinitionFiles } = require("./lib/fileSearcher.js");

const inputGroups = alfy.input.match(/"(.*)"\s*(\S*)/);
let projectPath = inputGroups[1];
let searchTerm = inputGroups[2];

const scratchOrgDefinitionFiles = getScratchOrgDefinitionFiles(
  projectPath + "/config"
);
const actionItems = getGlobalActionItems();
const scratchOrgDefinitionItems = await buildScratchOrgDefinitionItems(
  scratchOrgDefinitionFiles
);
alfy.output([
  ...actionItems,
  ...alfy.matches(searchTerm, scratchOrgDefinitionItems, "title"),
]);

async function buildScratchOrgDefinitionItems(scratchOrgDefinitionFiles) {
  return scratchOrgDefinitionFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.file,
      subtitle: `...${sfdxProjectFile.path}`,
      icon: { path: "./icn/file.icns" },
      arg: `sfdx:project:createscratchorg "${sfdxProjectFile.path}/${sfdxProjectFile.file}"`,
      path: sfdxProjectFile.path,
      mods: {
        ctrl: {
          subtitle: `...${sfdxProjectFile.path}`,
        },
        alt: {
          subtitle: `...${sfdxProjectFile.path}`,
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}
