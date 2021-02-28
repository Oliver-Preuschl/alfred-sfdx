const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(
  /(?:sfdx:package:version)?\s*(\S*)\s*(\S*)/
);
let packageId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:package:${packageId}:version`;
let packageVersions;
if (!alfy.cache.has(cacheKey)) {
  packageVersions = await queryPackageVersions(packageId);
  alfy.cache.set(cacheKey, packageVersions, {
    maxAge: 300000,
  });
} else {
  packageVersions = alfy.cache.get(cacheKey);
}
alfy.output(
  addActions(
    alfy
      .matches(searchTerm, packageVersions, "title")
      .sort((a, b) => (a.id > b.id ? -1 : 1))
  )
);

async function queryPackageVersions(packageId) {
  const sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:package:version:list --packages=${packageId}`,
    12,
    2
  );
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties[1] ? `${properties[1]}.` : "") +
          properties[0] +
          " - " +
          properties[3],
        subtitle: properties[4],
        icon: { path: alfy.icon.get("SidebarGenericFile") },
        arg: `sfdx:package:version:report ${properties[4]} `,
        id: properties[4],
        version: properties[3],
        mods: {
          alt: {
            subtitle: `Released: ${properties[7]}`,
          },
          cmd: {
            subtitle: `Ancestor: ${properties[9]}`,
          },
          ctrl: {
            subtitle: `Key: ${properties[6]}`,
          },
        },
      };
    })
    .filter((item) => !!item.id);
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
