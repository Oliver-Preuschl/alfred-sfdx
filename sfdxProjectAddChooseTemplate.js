"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");

const projectTemplate = alfy.input;

const pathItem = getPathItem(["Project", "Add"], {
  description: "Please choose a project template",
});

const templateItems = [
  { title: "standard" },
  { title: "empty" },
  { title: "analytics" },
];

alfy.output([pathItem, ...templateItems]);
