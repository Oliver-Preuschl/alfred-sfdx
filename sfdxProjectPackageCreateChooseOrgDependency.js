"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");

const { projectPath, packageDir, packageName, packageType } = process.env;

const pathItem = getPathItem(["Project", "Package", "Create"], {
  description: "Should the package be Org dependent?",
});

const templateItems = [
  {
    title: "Yes",
    variables: {
      action: "sfdx:project:package:create",
      projectPath,
      packageDir,
      packageName,
      packageType,
      isPackageOrgDependent: true,
    },
  },
  {
    title: "No",
    variables: {
      action: "sfdx:project:package:create",
      projectPath,
      packageDir,
      packageName,
      packageType,
      isPackageOrgDependent: false,
    },
  },
];

alfy.output([pathItem, ...templateItems]);
