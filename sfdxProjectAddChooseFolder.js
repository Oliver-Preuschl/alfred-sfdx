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
    icon: { path: "./icn/folder.png" },
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
