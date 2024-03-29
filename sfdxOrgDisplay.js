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
const { getOrgDetails, getAttributeList } = require("./lib/sfdxDataLoader.js");

const inputUsername = process.env.username;
const searchTerm = alfy.input;

const orgDetails = await getOrgDetails(inputUsername);
const orgDetailItems = alfy.matches(
  searchTerm,
  getOrgDetailItems(orgDetails),
  "subtitle"
);
const username = orgDetails.username;
const isDevHubAvailable = orgDetails.devHubId;
const mayBeDevHub = !isDevHubAvailable;

const pathItem = getPathItem(["Org", "Details"], {
  description: orgDetails.alias,
});
const actionItems = getActionItems(username, mayBeDevHub);

alfy.output([pathItem, ...actionItems, ...orgDetailItems]);

function getOrgDetailItems(orgDetails) {
  const orgDetailKey2Value = getAttributeList(orgDetails);
  return orgDetailKey2Value.map((orgDetail) => {
    return {
      title: orgDetail.value,
      subtitle: orgDetail.key,
      icon: { path: "./icons/info-circle-solid-blue.png" },
      arg: "",
      variables: {
        action: "sfdx:nop",
      },
      valid: true,
      mods: {
        ctrl: {
          subtitle: `COPY ${orgDetail.key}`,
          icon: { path: "./icons/copy-solid-blue.png" },
          variables: {
            action: "sfdx:copy",
            value: orgDetail.value,
          },
        },
        alt: {
          subtitle: orgDetail.key,
          valid: false,
        },
      },
    };
  });
}

function getActionItems(username, isDevHub) {
  const actions = [
    {
      title: "Open",
      subtitle: "OPEN Org",
      icon: { path: "./icons/external-link-alt-solid-blue.png" },
      arg: "",
      variables: {
        action: "sfdx:org:open",
        username,
      },
      valid: true,
      mods: {
        ctrl: {
          subtitle: "OPEN Org",
          variables: {
            action: "sfdx:org:open",
            username,
          },
        },
        alt: {
          subtitle: "OPEN Org",
          variables: {
            action: "sfdx:org:open",
            username,
          },
        },
      },
    },
  ];
  if (isDevHub) {
    actions.push({
      title: "Packages",
      subtitle: "SHOW Packages",
      icon: { path: "./icons/gift-solid-red.png" },
      arg: "",
      variables: {
        action: "sfdx:project:package:list",
        devhubUsername: username,
      },
      valid: true,
      mods: {
        ctrl: {
          subtitle: "SHOW Packages",
        },
        alt: {
          subtitle: "SHOW Packages",
        },
      },
    });
  }
  return actions;
}
