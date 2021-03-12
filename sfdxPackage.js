"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const { projectPath, devHubUsername } = process.env;
const searchTerm = alfy.input;

const path = projectPath
  ? `${process.env.workspace}/${projectPath}`
  : "alfred-sfdx";

const cacheKey = `sfdx:package:${devHubUsername}`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd "${path}"; sfdx force:package:list --targetdevhubusername ${devHubUsername}`,
    2
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const packageItems = alfy.matches(
  searchTerm,
  await getPackageItems(sfdxPropertyLines, devHubUsername),
  "title"
);
const pathItem = getPathItem("Project", "Packages");
const globalActionItems = getGlobalActionItems();
alfy.output([pathItem, ...globalActionItems, ...packageItems]);

async function getPackageItems(sfdxPropertyLines, devHubUsername) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties["Namespace Prefix"]
            ? `${properties["Namespace Prefix"]}.`
            : "") + properties["Name"],
        subtitle: `Id: ${properties["Id"]}`,
        icon: { path: "./icn/gift.icns" },
        variables: {
          action: "sfdx:package:version",
          packageId: properties["Id"],
          devHubUsername,
        },
        mods: {
          ctrl: {
            subtitle: `COPY Id: "${properties["Id"]}"`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              packageId: properties["Id"],
            },
          },
          alt: {
            subtitle: `Type: ${properties["Type"]}`,
          },
          cmd: {
            subtitle: `Description: ${properties["Description"]}`,
          },
        },
      };
    })
    .filter((line) => !!line.title);
}
