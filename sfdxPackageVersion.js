"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let packageId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:package:${packageId}:version`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:package:version:list --packages=${packageId}`,
    2
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: 300000,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const actionItems = getGlobalActionItems();
const packageVersionItems = alfy
  .matches(searchTerm, await getPackageVersionItems(sfdxPropertyLines), "title")
  .sort((a, b) => (a.id > b.id ? -1 : 1));
alfy.output([...actionItems, ...packageVersionItems]);

async function getPackageVersionItems(sfdxPropertyLines) {
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
        arg: `sfdx:package:version:report ${propertyLine["Subscriber Package Version Id"]} `,
        id: propertyLine["Subscriber Package Version Id"],
        version: propertyLine["Version"],
        mods: {
          ctrl: {
            subtitle: `[COPY] Installation URL: /packaging/installPackage.apexp?p0=${propertyLine["Subscriber Package Version Id"]}`,
            icon: { path: "./icn/copy.icns" },
            arg: propertyLine["Subscriber Package Version Id"],
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
