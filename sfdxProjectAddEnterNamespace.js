"use strict";

const alfy = require("alfy");

const { relativeProjectPath, projectName } = process.env;
const projectNamespace = alfy.input;

const inputRequestItem = {
  title: "Please enter project namespace",
  subtitle: "Leave empty for no namepace",
  icon: { path: "./icons/check-circle-solid.png" },
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icons/check-circle-solid.png" },
  variables: {
    action: "sfdx:project:add:choosetemplate",
    relativeProjectPath,
    projectName,
    projectNamespace,
  },
};
const invalidProjectNamespaceItem = {
  title: "Invalid project namespace",
  subtitle: "The project namespace may contain letter, numbers, '-' and '_'",
  icon: { path: "./icons/warning.png" },
  valid: false,
};
const projectNamespacePattern = /^[a-zA-Z\d-_]+$/;
const isProjectNameValid = projectNamespacePattern.test(projectNamespace);

const items = !projectNamespace
  ? [inputRequestItem]
  : isProjectNameValid
  ? [confirmItem]
  : [invalidProjectNamespaceItem];

alfy.output(items);
