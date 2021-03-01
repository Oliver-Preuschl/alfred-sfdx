"use strict";

const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(
  /(?:sfdx:package:version:report)?\s*(\S*)\s*(\S*)/
);
let packageVersionId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:package:${packageVersionId}:report`;

let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:package:version:report --package=${packageVersionId}`,
    2,
    2,
    { propertyNames: ["key", "value"] }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const packageVersionReport = await buildPackageVersionReportItems(
  sfdxPropertyLines
);

alfy.output(
  addActions(alfy.matches(searchTerm, packageVersionReport, "subtitle"))
);

async function buildPackageVersionReportItems(packageVersionId) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties.value,
        subtitle: properties.key,
        icon: { path: alfy.icon.info },
        arg: properties.value,
      };
    })
    .filter((item) => !!item.arg);
}

function addActions(items) {
  const actions = [
    {
      title: "Back",
      subtitle: "Go to Start",
      icon: { path: alfy.icon.get("BackwardArrowIcon") },
      arg: `sfdx`,
    },
  ];
  return [...actions, ...items];
}
