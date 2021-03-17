"use strict";

const alfy = require("alfy");

const { projectPath, packageDir } = process.env;
const packageName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icn/edit.icns" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icn/check-circle-o.icns" },
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
  icon: { path: "./icn/warning.icns" },
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
