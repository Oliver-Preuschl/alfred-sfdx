"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:scratch";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list --verbose",
    1,
    {
      startLineKeyword: "EXPIRATION DATE",
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const pathItem = getPathItem("Orgs (Scratch)");
const actionItems = await getGlobalActionItems();
const orgItems = alfy.matches(
  searchTerm,
  await getOrgItems(sfdxPropertyLines),
  "title"
);

alfy.output([pathItem, ...actionItems, ...orgItems]);

async function getOrgItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties["ALIAS"],
        subtitle: `${properties["STATUS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
        variables: {
          action: "sfdx:org:display",
          username: properties["USERNAME"],
        },
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `OPEN Org`,
            icon: { path: "./icn/external-link.icns" },
            variables: {
              action: "sfdx:org:open",
              value: properties["USERNAME"],
            },
          },
          alt: {
            subtitle: `COPY Username: "${properties["USERNAME"]}"`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              value: properties["USERNAME"],
            },
          },
          cmd: {
            subtitle: `COPY Instance URL: ${properties["INSTANCE URL"]}`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              value: properties["INSTANCE URL"],
            },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
