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
    6,
    2,
    {
      propertyNames: [
        "namespace",
        "name",
        "id",
        "alias",
        "description",
        "type",
      ],
    }
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
          (properties.namespace ? `${properties.namespace}.` : "") +
          properties.name,
        subtitle: `Id: ${properties.id}`,
        icon: { path: "./icn/gift.icns" },
        arg: `sfdx:package:version ${properties.id}`,
        id: properties.id,
        mods: {
          ctrl: {
            subtitle: `[COPY] ${properties.id}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties.id,
          },
          alt: {
            subtitle: `Type: ${properties.type}`,
          },
          cmd: {
            subtitle: `Description: ${properties.description}`,
          },
        },
      };
    })
    .filter((line) => !!line.title);
}
