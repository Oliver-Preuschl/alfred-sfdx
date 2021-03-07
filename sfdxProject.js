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
const actionsItems = getGlobalActionItems();
const projectPathItems = alfy.matches(
  searchTerm,
  await getAvailableProjectPathItems(sfdxProjectFiles),
  "title"
);
alfy.output([...actionsItems, ...projectPathItems]);

async function getAvailableProjectPathItems(sfdxProjectFiles) {
  return sfdxProjectFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.folder,
      subtitle: `...${sfdxProjectFile.path}`,
      icon: { path: "./icn/folder.icns" },
      arg: `sfdx:project:details "${sfdxProjectFile.path}"`,
      path: sfdxProjectFile.path,
      mods: {
        ctrl: {
          subtitle: `[OPEN PROJECT FILE] "...${sfdxProjectFile.path}/sfdx-project.json"`,
          icon: { path: "./icn/eye.icns" },
          arg: `sfdx:project:open:file ${sfdxProjectFile.path}/sfdx-project.json`,
        },
        alt: {
          subtitle: `[OPEN PROJECT FOLDER] "...${sfdxProjectFile.path}"`,
          icon: { path: "./icn/eye.icns" },
          arg: `sfdx:project:open:file ${sfdxProjectFile.path}`,
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}
