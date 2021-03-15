"use strict";

const alfy = require("alfy");

const projectNamespace = alfy.input;

const inputRequestItem = {
  title: "Please enter project namespace",
  subtitle: "Leave empty for no namepace",
  icon: { path: "./icn/check-circle-o.icns" },
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icn/check-circle-o.icns" },
};
const invalidProjectNamespaceItem = {
  title: "Invalid project namespace",
  subtitle: "The project namespace may contain letter, numbers, '-' and '_'",
  icon: { path: "./icn/warning.icns" },
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
