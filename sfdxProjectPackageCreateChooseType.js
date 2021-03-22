"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");

const { projectPath, packageDir, packageName } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Please choose a package type",
  hideHomeLink: true,
});

const templateItems = [
  {
    title: "Unlocked",
    variables: {
      action: "sfdx:project:package:create:chooseorgdependency",
      projectPath,
      packageDir,
      packageName,
      packageType: "Unlocked",
    },
  },
  {
    title: "Managed",
    variables: {
      action: "sfdx:project:package:create:chooseorgdependency",
      projectPath,
      packageDir,
      packageName,
      packageType: "Managed",
    },
  },
];

alfy.output([pathItem, ...templateItems]);
