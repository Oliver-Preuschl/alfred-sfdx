"use strict";

const alfy = require("alfy");

const projectName = alfy.input;

const inputRequestItem = {
  title: "Please enter Project Name",
  icon: { path: "./icn/edit.icns" },
  valid: false,
};
const confirmItem = {
  title: "OK",
  icon: { path: "./icn/check-circle-o.icns" },
};
const invalidProjectNameItem = {
  title: "Invalid Project Name",
  subtitle: "The Project Name may contain letter, numbers, '-' and '_'",
  icon: { path: "./icn/warning.icns" },
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
