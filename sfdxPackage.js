const alfy = require("alfy");
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
//alfy.log(sfdxPropertyLines);
const packageItems = enrichWithProjectPath(
  alfy.matches(searchTerm, await getPackageItems(sfdxPropertyLines), "title")
);
const actionItems = getActionItems();
alfy.output([...actionItems, ...packageItems]);

async function getPackageItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties.namespace ? `${properties.namespace}.` : "") +
          properties.name,
        subtitle: `Id: ${properties.id}`,
        icon: { path: alfy.icon.get("SidebarGenericFolder") },
        arg: `sfdx:package:version ${properties.id}`,
        id: properties.id,
        mods: {
          alt: {
            subtitle: `Description: ${properties.description}`,
          },
          cmd: {
            subtitle: `Type: ${properties.type}`,
          },
          /*ctrl: {
            subtitle: `[SET PROJECT-PATH] -`,
            arg: `sfdx:package:config:searchpath ${properties.id} `,
            icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          },*/
        },
      };
    })
    .filter((line) => !!line.title);
}

function enrichWithProjectPath(packages) {
  return packages.map((sfdxPackage) => {
    const sfdxPackageToReturn = { ...sfdxPackage };
    const configKey = `sfdx:package:${sfdxPackageToReturn.id}:config:path`;
    if (alfy.config.has(configKey)) {
      const projectPath = alfy.config.get(configKey);
      //sfdxPackageToReturn.mods.ctrl.subtitle = `[SET] [PROJECT PATH] "${projectPath}"`;
    }
    return sfdxPackageToReturn;
  });
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
