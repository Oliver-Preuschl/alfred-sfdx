"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");

const { relativeProjectPath, projectName, projectNamespace } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Add"], {
  description: "Please choose a project template",
  hideHomeLink: true,
});

const templateItems = [
  {
    title: "standard",
    variables: {
      action: "sfdx:project:add",
      relativeProjectPath,
      projectName,
      projectNamespace,
      projectTemplate: "standard",
    },
  },
  {
    title: "empty",
    variables: {
      action: "sfdx:project:add",
      relativeProjectPath,
      projectName,
      projectNamespace,
      projectTemplate: "empty",
    },
  },
  {
    title: "analytics",
    variables: {
      action: "sfdx:project:add",
      relativeProjectPath,
      projectName,
      projectNamespace,
      projectTemplate: "analytics",
    },
  },
];

alfy.output([pathItem, ...templateItems]);
