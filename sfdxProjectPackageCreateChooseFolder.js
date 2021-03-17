"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getPotentialPackageDirs } = require("./lib/fileSearcher.js");

const { projectPath } = process.env;
let searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Please choose Package Folder",
});

const potentialPackageDirs = getPotentialPackageDirs(projectPath);

const workspacePathItems = alfy.matches(
  searchTerm,
  await getAvailablePackageDirItems(potentialPackageDirs),
  "title"
);
alfy.output([pathItem, ...workspacePathItems]);

function getAvailablePackageDirItems(sfdxWorkspacePaths) {
  return potentialPackageDirs.map((potentialPackageDir) => ({
    title: potentialPackageDir,
    subtitle: "",
    icon: { path: "./icn/folder.icns" },
    arg: "",
    variables: {
      action: "sfdx:project:package:create:entername",
      projectPath,
      packageDir: potentialPackageDir,
    },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  }));
}
