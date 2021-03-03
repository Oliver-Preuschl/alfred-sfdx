"use strict";

const alfy = require("alfy");
const {
  getSfdxPropertyLines,
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
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
const packageVersionDetailName2PackageVersionDetail = getKey2PropertyLineFromPropertyLines(
  sfdxPropertyLines,
  "key"
);
const installationUrlItem = {
  title: `/packaging/installPackage.apexp?p0=${
    packageVersionDetailName2PackageVersionDetail.get(
      "Subscriber Package Version Id"
    ).value
  }`,
  subtitle: "Installation URL",
  arg: `/packaging/installPackage.apexp?p0=${
    packageVersionDetailName2PackageVersionDetail.get(
      "Subscriber Package Version Id"
    ).value
  }`,
  icon: { path: alfy.icon.get("SidebarNetwork") },
};

const actionItems = getActionItems();
const packageVersionReportItems = alfy.matches(
  searchTerm,
  await getPackageVersionReportItems(sfdxPropertyLines),
  "subtitle"
);

alfy.output([...actionItems, ...packageVersionReportItems]);

async function getPackageVersionReportItems(packageVersionId) {
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

function getActionItems() {
  return [
    {
      title: "Back",
      subtitle: "Go to Start",
      icon: { path: alfy.icon.get("BackwardArrowIcon") },
      arg: `sfdx`,
    },
  ];
}
