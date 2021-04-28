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

const searchTerm = alfy.input;

const pathItem = getPathItem(["Orgs (Scratch)"]);
const orgs = await getScratchOrgs();
const orgItems = alfy.matches(searchTerm, getOrgItems(orgs), "title");

alfy.output([pathItem, ...orgItems]);

function getOrgItems(orgs) {
  return orgs
    .map((org) => {
      return {
        title: org.alias,
        subtitle: `${org.status} (Expiration Date: ${org.expirationDate})`,
        variables: {
          action: "sfdx:org:display",
          username: org.username,
        },
        icon: { path: "./icons/cloud-solid-blue.png" },
        mods: {
          ctrl: {
            subtitle: `OPEN Org`,
            icon: { path: "./icons/external-link-alt-solid-blue.png" },
            variables: {
              action: "sfdx:org:open",
              username: org.username,
            },
          },
          alt: {
            subtitle: `COPY Username: "${org.username}"`,
            icon: { path: "./icons/copy-solid-blue.png" },
            variables: {
              action: "sfdx:copy",
              value: org.username,
            },
          },
          cmd: {
            subtitle: `COPY Instance URL: ${org.instanceUrl}`,
            icon: { path: "./icons/copy-solid-blue.png" },
            variables: {
              action: "sfdx:copy",
              value: org.instanceUrl,
            },
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
