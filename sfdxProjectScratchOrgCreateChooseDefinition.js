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
