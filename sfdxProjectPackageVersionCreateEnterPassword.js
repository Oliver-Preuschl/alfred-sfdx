"use strict";

const alfy = require("alfy");

const { projectPath, packageId } = process.env;
const password = alfy.input;

const inputRequestItem = {
  title: "Please enter Password",
  subtitle: "Leave blank for no password",
  icon: { path: "./icn/edit.icns" },
  valid: true,
  variables: {
    action: "sfdx:project:package:create:version",
    projectPath,
    packageId,
    password,
  },
};

alfy.output([inputRequestItem]);
