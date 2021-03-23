"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getPotentialPackageDirs } = require("./lib/fileSearcher.js");

const { projectPath } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Please choose Package Folder",
  hideHomeLink: true,
});

const potentialPackageDirs = getPotentialPackageDirs(projectPath, projectPath);

const workspacePathItems = alfy.matches(
  searchTerm,
  await getPackageDirItems(potentialPackageDirs),
  "title"
);
alfy.output([pathItem, ...workspacePathItems]);

function getPackageDirItems(potentialPackageDirs, projectPath) {
  return potentialPackageDirs.map((potentialPackageDir) => ({
    title: potentialPackageDir,
    subtitle: "",
    icon: { path: "./icons/folder-solid.png" },
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
