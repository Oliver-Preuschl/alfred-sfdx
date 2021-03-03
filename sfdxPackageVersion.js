const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
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
const actionItems = getActionItems();
const packageVersionItems = alfy
  .matches(searchTerm, await getPackageVersionItems(sfdxPropertyLines), "title")
  .sort((a, b) => (a.id > b.id ? -1 : 1));
alfy.output([...actionItems, ...packageVersionItems]);

async function getPackageVersionItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((propertyLine) => {
      const packageNameWithNamespace =
        (propertyLine.namespace ? `${propertyLine.namespace}.` : "") +
        propertyLine.packageName;
      const releasedStatus =
        propertyLine.released === "true" ? " (Released)" : "";
      return {
        title: `${packageNameWithNamespace} - ${propertyLine.version}${releasedStatus}`,
        subtitle: propertyLine.packageVersionId,
        icon: { path: alfy.icon.get("SidebarGenericFile") },
        arg: `sfdx:package:version:report ${propertyLine.packageVersionId} `,
        id: propertyLine.packageVersionId,
        version: propertyLine.version,
        mods: {
          alt: {
            subtitle: `Version Name: ${propertyLine.versionName}`,
          },
          cmd: {
            subtitle: `Ancestor: ${propertyLine.ancestor}`,
          },
          ctrl: {
            subtitle: `Installation URL: /packaging/installPackage.apexp?p0=${propertyLine.packageVersionId}`,
          },
        },
      };
    })
    .filter((item) => !!item.id);
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
