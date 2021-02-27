const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)\s*(\S*)/);
let packageVersionId = inputGroups[2];
let searchTerm = inputGroups[3];

const cacheKey = `sfdx:package:${packageVersionId}:report`;
let packageVersionReport;
if (!alfy.cache.has(cacheKey)) {
  packageVersionReport = await queryPackageVersionReport(packageVersionId);
  alfy.cache.set(cacheKey, packageVersionReport, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  packageVersionReport = alfy.cache.get(cacheKey);
}
alfy.output(
  addActions(alfy.matches(searchTerm, packageVersionReport, "subtitle"))
);

async function queryPackageVersionReport(packageVersionId) {
  const sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:package:version:report --package=${packageVersionId}`,
    2,
    2
  );
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties[1],
        subtitle: properties[0],
        icon: { path: alfy.icon.info },
        arg: properties[1],
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
