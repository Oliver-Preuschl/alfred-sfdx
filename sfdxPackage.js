const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let searchTerm = inputGroups[2];

const cacheKey = "sfdx:package";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryPackages();
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(addActions(alfy.matches(searchTerm, packages, "title")));

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
            subtitle: `Alias: ${properties[3]}`,
          },
        },
      };
    })
    .filter((line) => !!line.title);
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
