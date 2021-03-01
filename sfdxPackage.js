const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(?:sfdx:package)?\s*(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:package";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryPackages();
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(
  addActions(alfy.matches(searchTerm, enrichWithProjectPath(packages), "title"))
);

async function queryPackages() {
  const sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:package:list",
    6,
    2
  );
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: (properties[0] ? `${properties[0]}.` : "") + properties[1],
        subtitle: `Id: ${properties[2]}`,
        icon: { path: alfy.icon.get("SidebarGenericFolder") },
        arg: `sfdx:package:version ${properties[2]}`,
        id: properties[2],
        mods: {
          alt: {
            subtitle: `Description: ${properties[4]}`,
          },
          cmd: {
            subtitle: `Type: ${properties[5]}`,
          },
          ctrl: {
            subtitle: `[SET] Project Path: -`,
            arg: `sfdx:package:config:searchpath ${properties[2]} `,
            icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          },
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
      sfdxPackageToReturn.mods.ctrl.subtitle = `[SET] Project Path: ${projectPath}`;
    }
    return sfdxPackageToReturn;
  });
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
