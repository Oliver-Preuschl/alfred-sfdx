"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const {
  getSfdxPropertyLines,
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

let inputUsername = process.env.username;
let searchTerm = alfy.input;

const cacheKey = `sfdx:org:${inputUsername}:display`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:org:display --targetusername=${inputUsername} --verbose`,
    4
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const orgDetails = getOrgDetailItems(sfdxPropertyLines);
const orgDetailName2OrgDetail = getKey2PropertyLineFromPropertyLines(
  sfdxPropertyLines,
  "KEY"
);
const pathItem = getPathItem(["Org", "Details"], {
  description: orgDetailName2OrgDetail.get("Alias")["VALUE"],
});
const orgDetailItems = alfy.matches(searchTerm, orgDetails, "subtitle");
const username = orgDetailName2OrgDetail.get("Username")["VALUE"];
const isDevHubAvailable = orgDetailName2OrgDetail.has("Dev Hub Id");
const isConnectedStatusAvailable = orgDetailName2OrgDetail.has(
  "Connected Status"
);
const isDevHub = !isDevHubAvailable && !isConnectedStatusAvailable;
const actionItems = getActionItems(username, isDevHub);

alfy.output([pathItem, ...actionItems, ...orgDetailItems]);

function getOrgDetailItems(sfdxPropertyLines) {
  return sfdxPropertyLines.map((properties) => {
    return {
      title: properties["VALUE"],
      subtitle: properties["KEY"],
      icon: { path: "./icn/info-circle.icns" },
      arg: "",
      variables: {
        action: "sfdx:nop",
      },
      valid: true,
      mods: {
        ctrl: {
          subtitle: `COPY ${properties["KEY"]}`,
          icon: { path: "./icn/copy.icns" },
          variables: {
            action: "sfdx:copy",
            value: properties["VALUE"],
          },
        },
        alt: {
          subtitle: properties["KEY"],
          icon: { path: "./icn/info-circle.icns" },
          variables: {},
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
      icon: { path: "./icn/external-link.icns" },
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
      icon: { path: "./icn/gift.icns" },
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
