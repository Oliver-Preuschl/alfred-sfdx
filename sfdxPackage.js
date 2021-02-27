const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

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

async function getSfdxPropertyLines(command, columnCount, separatorLineIndex) {
  const { stdout, stderr } = await exec(command);

  let sfdxOutputLines = stdout.split("\n");

  const separatorLine = sfdxOutputLines[separatorLineIndex];
  const pattern = "\\s*" + "(─*)\\s*".repeat(columnCount - 1) + "(─*)";
  const separatorLineGroups = separatorLine.match(new RegExp(pattern));

  sfdxOutputLines = sfdxOutputLines.slice(separatorLineIndex + 1);
  return sfdxOutputLines.map((line) => {
    const properties = [];
    let position = 0;
    for (let i = 1; i <= columnCount; i++) {
      const value = line.slice(
        position,
        position + separatorLineGroups[i].length + 2
      );
      properties.push(value.trim());
      position += separatorLineGroups[i].length + 2;
    }
    return properties;
  });
}
