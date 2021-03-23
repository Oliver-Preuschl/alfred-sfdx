"use strict";

const alfy = require("alfy");

const { projectPath, packageDir } = process.env;
const packageName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icons/edit.png" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icons/check-circle-solid.png" },
  variables: {
    action: "sfdx:project:package:create:choosetype",
    projectPath,
    packageDir,
    packageName,
  },
};
const invalidPackageNameItem = {
  title: "Invalid Package Name",
  subtitle: "The Package Name may contain letter, numbers, '-' and '_'",
  icon: { path: "./icons/warning.png" },
  valid: false,
};
const packageNamePattern = /^[a-zA-Z\d-_]+$/;
const isPackageNameValid = packageNamePattern.test(packageName);

const items = !packageName
  ? [inputRequestItem]
  : isPackageNameValid
  ? [confirmItem]
  : [invalidPackageNameItem];

alfy.output(items);
