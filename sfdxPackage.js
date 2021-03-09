"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:package";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:package:list",
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
  await getPackageItems(sfdxPropertyLines),
  "title"
);
const actionItems = getGlobalActionItems();
alfy.output([...actionItems, ...packageItems]);

async function getPackageItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties["Namespace Prefix"]
            ? `${properties["Namespace Prefix"]}.`
            : "") + properties["Name"],
        subtitle: `Id: ${properties["Id"]}`,
        icon: { path: "./icn/gift.icns" },
        arg: `sfdx:package:version ${properties["Id"]}`,
        id: properties["Id"],
        mods: {
          ctrl: {
            subtitle: `[COPY] ${properties["Id"]}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties["Id"],
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
