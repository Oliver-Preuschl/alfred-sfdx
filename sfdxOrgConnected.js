"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:connected";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list",
    1,
    {
      startLineKeyword: "CONNECTED STATUS",
      endLineKeyword: "EXPIRATION DATE",
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const pathItem = getPathItem("Orgs (Connected)");
const globalActionItems = getGlobalActionItems();
const orgItems = alfy.matches(
  searchTerm,
  await getOrgItems(sfdxPropertyLines),
  "title"
);
alfy.output([pathItem, ...globalActionItems, ...orgItems]);

async function getOrgItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties[""] ? `${properties[""]} ` : "") + properties["ALIAS"],
        subtitle: `Connection Status: ${properties["CONNECTED STATUS"]}`,
        variables: {
          action: "sfdx:org:display",
          username: properties["USERNAME"],
        },
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `OPEN "${properties["USERNAME"]}"`,
            icon: { path: "./icn/external-link.icns" },
            variables: {
              action: "sfdx:org:open",
              value: properties["USERNAME"],
            },
          },
          alt: {
            subtitle: `SHOW Packages`,
            variables: {
              action: "sfdx:project:package:list",
              devHubUsername: properties["USERNAME"],
            },
            icon: { path: "./icn/gear.icns" },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
