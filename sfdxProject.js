"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const {
  findFolderWithMatchingFileInWorkspace,
} = require("./lib/fileSearcher.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = `sfdx:project:paths`;
let sfdxProjectFiles;
if (!alfy.cache.has(cacheKey)) {
  sfdxProjectFiles = await findFolderWithMatchingFileInWorkspace(
    "sfdx-project.json"
  );
  alfy.cache.set(cacheKey, sfdxProjectFiles, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxProjectFiles = alfy.cache.get(cacheKey);
}
const globalActionsItems = getGlobalActionItems();
const projectPathItems = alfy.matches(
  searchTerm,
  await getAvailableProjectPathItems(sfdxProjectFiles),
  "title"
);
alfy.output([...globalActionsItems, ...projectPathItems]);

async function getAvailableProjectPathItems(sfdxProjectFiles) {
  return sfdxProjectFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.folder,
      subtitle: `...${sfdxProjectFile.path}`,
      icon: { path: "./icn/folder.icns" },
      arg: "",
      variables: {
        action: "sfdx:project:details",
        projectPath: sfdxProjectFile.path,
      },
      path: sfdxProjectFile.path,
      mods: {
        ctrl: {
          subtitle: `OPEN "...${sfdxProjectFile.path}/sfdx-project.json"`,
          icon: { path: "./icn/eye.icns" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: `${sfdxProjectFile.path}/sfdx-project.json`,
          },
        },
        alt: {
          subtitle: `OPEN "...${sfdxProjectFile.path}"`,
          icon: { path: "./icn/eye.icns" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: sfdxProjectFile.path,
          },
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}
