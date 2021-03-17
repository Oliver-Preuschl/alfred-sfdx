"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getWorkspaceDirs } = require("./lib/fileSearcher.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = `sfdx:workspace:paths`;
let sfdxWorkspacePaths;
if (!alfy.cache.has(cacheKey)) {
  sfdxWorkspacePaths = await getWorkspaceDirs();
  alfy.cache.set(cacheKey, sfdxWorkspacePaths, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxWorkspacePaths = alfy.cache.get(cacheKey);
}
const pathItem = getPathItem(["Projects", "Add"], {
  description: "Please choose Folder",
});
const globalActionsItems = getGlobalActionItems();
const workspacePathItems = alfy.matches(
  searchTerm,
  await getAvailableWorkspacePathItems(sfdxWorkspacePaths),
  "title"
);
alfy.output([pathItem, ...globalActionsItems, ...workspacePathItems]);

function getAvailableWorkspacePathItems(sfdxWorkspacePaths) {
  return sfdxWorkspacePaths.map((workspaceDir) => ({
    title: workspaceDir.relativePath,
    subtitle: `${workspaceDir.path}`,
    icon: { path: "./icn/folder.icns" },
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
