"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const { projectPath, packageId, devHubUsername } = process.env;

const path = projectPath
  ? `${process.env.workspace}/${projectPath}`
  : "alfred-sfdx";
const targetDevHubUsernameArg = devHubUsername
  ? `--targetdevhubusername ${devHubUsername}`
  : "";
const searchTerm = alfy.input;

const cacheKey = `sfdx:package:${packageId}:version`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd "${path}"; sfdx force:package:version:list ${targetDevHubUsernameArg} --packages=${packageId}`,
    2
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: 300000,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const pathItem = getPathItem("Project", "Package", "Versions");
const globalActionItems = getGlobalActionItems();
const packageVersionItems = alfy
  .matches(
    searchTerm,
    await getPackageVersionItems(sfdxPropertyLines, devHubUsername),
    "title"
  )
  .sort((a, b) => (a.id > b.id ? -1 : 1));
alfy.output([pathItem, ...globalActionItems, ...packageVersionItems]);

async function getPackageVersionItems(sfdxPropertyLines, devHubUsername) {
  return sfdxPropertyLines
    .map((propertyLine) => {
      const packageNameWithNamespace =
        (propertyLine["Namespace"] ? `${propertyLine["Namespace"]}.` : "") +
        propertyLine["Package Name"];
      const releasedStatus =
        propertyLine["Released"] === "true" ? " (Released)" : "";
      return {
        title: `${packageNameWithNamespace} - ${propertyLine["Version"]}${releasedStatus}`,
        subtitle: `${propertyLine["Subscriber Package Version Id"]}`,
        icon: { path: "./icn/gift.icns" },
        variables: {
          action: "sfdx:package:version:report",
          packageVersionId: propertyLine["Subscriber Package Version Id"],
          projectPath,
          devHubUsername,
          packageNameWithNamespace,
        },
        id: propertyLine["Subscriber Package Version Id"],
        version: propertyLine["Version"],
        mods: {
          ctrl: {
            subtitle: `[COPY] Installation URL: /packaging/installPackage.apexp?p0=${propertyLine["Subscriber Package Version Id"]}`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              value: `/packaging/installPackage.apexp?p0=${propertyLine["Subscriber Package Version Id"]}`,
            },
          },
          alt: {
            subtitle: `Version Name: ${propertyLine["Version Name"]}`,
          },
          cmd: {
            subtitle: `Ancestor: ${propertyLine["Ancestor"]}`,
          },
        },
      };
    })
    .filter((item) => !!item.id);
}
