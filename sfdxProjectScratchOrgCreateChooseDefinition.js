"use strict";

const alfy = require("alfy");
const util = require("util");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getScratchOrgDefinitionFiles } = require("./lib/fileSearcher.js");

let projectPath = process.env.projectPath;
let searchTerm = alfy.input;

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
      variables: {
        action: "sfdx:project:scratchorg:create",
        scratchOrgDefinitionFilePath: `${sfdxProjectFile.path}/${sfdxProjectFile.file}`,
      },
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
