const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(
  /(?:sfdx:package:version)?\s*(\S*)\s*(\S*)/
);
let packageId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:package:${packageId}:version`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:package:version:list --packages=${packageId}`,
    12,
    2,
    {
      propertyNames: [
        "packageName",
        "namespace",
        "versionName",
        "version",
        "packageVersionId",
        "alias",
        "installationKey",
        "released",
        "validationSkipped",
        "ancestor",
        "ancestorVersion",
        "branch",
      ],
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: 300000,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const packageVersions = await buildPackageVersionItems(sfdxPropertyLines);
alfy.output(
  addActions(
    alfy
      .matches(searchTerm, packageVersions, "title")
      .sort((a, b) => (a.id > b.id ? -1 : 1))
  )
);

async function buildPackageVersionItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties.namespace ? `${properties.namespace}.` : "") +
          properties.packageName +
          " - " +
          properties.version,
        subtitle: properties.packageVersionId,
        icon: { path: alfy.icon.get("SidebarGenericFile") },
        arg: `sfdx:package:version:report ${properties.packageVersionId} `,
        id: properties.packageVersionId,
        version: properties.version,
        mods: {
          alt: {
            subtitle: `Released: ${properties.released}`,
          },
          cmd: {
            subtitle: `Ancestor: ${properties.ancestor}`,
          },
          ctrl: {
            subtitle: `Key: ${properties.installationKey}`,
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
