"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const {
  findDirsWithMatchingFileInWorkspace,
} = require("./lib/fileSearcher.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = `sfdx:project:paths`;
let sfdxProjectFiles;
if (!alfy.cache.has(cacheKey)) {
  sfdxProjectFiles = await findDirsWithMatchingFileInWorkspace(
    "sfdx-project.json"
  );
  alfy.cache.set(cacheKey, sfdxProjectFiles, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxProjectFiles = alfy.cache.get(cacheKey);
}
const pathItem = getPathItem(["Projects"]);
const addProjectItem = getAddProjectItem();
const globalActionsItems = getGlobalActionItems();
const projectPathItems = alfy.matches(
  searchTerm,
  await getAvailableProjectPathItems(sfdxProjectFiles),
  "title"
);
alfy.output([
  pathItem,
  addProjectItem,
  ...globalActionsItems,
  ...projectPathItems,
]);

function getAddProjectItem() {
  return {
    title: "Add Project",
    icon: { path: "./icn/plus-circle.icns" },
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

function getAvailableProjectPathItems(sfdxProjectFiles) {
  return sfdxProjectFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.dir,
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
