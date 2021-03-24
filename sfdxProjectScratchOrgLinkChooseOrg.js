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
const { getScratchOrgs } = require("./lib/sfdxDataLoader.js");

const projectPath = process.env.projectPath;
const searchTerm = alfy.input;

const scratchOrgs = await getScratchOrgs();
const pathItem = getPathItem(["Project", "Org (Scratch)", "Link"], {
  description: "Please choose Scratch Org",
  hideHomeLink: true,
});
const orgItems = await buildOrgItems(scratchOrgs, projectPath);
alfy.output([pathItem, ...alfy.matches(searchTerm, orgItems, "title")]);

async function buildOrgItems(scratchOrgs, projectPath) {
  return scratchOrgs
    .map((scratchOrg) => {
      return {
        title: scratchOrg["ALIAS"],
        subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
        icon: { path: "./icons/cloud-solid-blue.png" },
        arg: "",
        variables: {
          action: "sfdx:project:scratchorg:link",
          projectPath,
          username: scratchOrg["USERNAME"],
        },
        mods: {
          ctrl: {
            subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
          },
          alt: {
            subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
