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
const { getPackages } = require("./lib/sfdxDataLoader.js");

const { projectPath, devhubUsername } = process.env;
const searchTerm = alfy.input;

const packages = await getPackages(devhubUsername, {
  relativeProjectPath: projectPath,
});
const packageItems = alfy.matches(
  searchTerm,
  getPackageItems(packages, devhubUsername),
  "title"
);
const pathItem = projectPath
  ? getPathItem(["Project", "Packages"], { description: projectPath })
  : devhubUsername
  ? getPathItem(["Connected Org", "Packages"], { description: devhubUsername })
  : getPathItem(["Packages"]);
alfy.output([pathItem, ...packageItems]);

function getPackageItems(packages, devhubUsername) {
  return packages
    .map((singlePackage) => {
      return {
        title:
          (singlePackage["Namespace Prefix"]
            ? `${singlePackage["Namespace Prefix"]}.`
            : "") + singlePackage["Name"],
        subtitle: `Id: "${singlePackage["Id"]}"`,
        icon: { path: "./icons/gift-solid-red.png" },
        variables: {
          action: "sfdx:package:version",
          packageId: singlePackage["Id"],
          devhubUsername,
        },
        mods: {
          ctrl: {
            subtitle: `COPY Id: "${singlePackage["Id"]}"`,
            icon: { path: "./icons/copy-solid-red.png" },
            variables: {
              action: "sfdx:copy",
              packageId: singlePackage["Id"],
            },
          },
          alt: {
            subtitle: `Type: ${singlePackage["Type"]}`,
          },
          cmd: {
            subtitle: `Description: ${singlePackage["Description"]}`,
          },
        },
      };
    })
    .filter((line) => !!line.title);
}
