"use strict";

const alfy = require("alfy");

const { relativeProjectPath } = process.env;
const projectName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icn/edit.png" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icn/check-circle-o.png" },
  variables: {
    action: "sfdx:project:add:enternamespace",
    relativeProjectPath,
    projectName,
  },
};
const invalidProjectNameItem = {
  title: "Invalid Project Name",
  subtitle: "The Project Name may contain letter, numbers, '-' and '_'",
  icon: { path: "./icn/warning.png" },
  valid: false,
};
const projectNamePattern = /^[a-zA-Z\d-_]+$/;
const isProjectNameValid = projectNamePattern.test(projectName);

const items = !projectName
  ? [inputRequestItem]
  : isProjectNameValid
  ? [confirmItem]
  : [invalidProjectNameItem];

alfy.output(items);
