/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

const filteredTemplateItems = alfy.matches(searchTerm, templateItems, "title");

alfy.output([pathItem, ...filteredTemplateItems]);
