const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let searchTerm = inputGroups[2];

const cacheKey = "sfdx:package";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryPackages(searchTerm);
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(alfy.matches(searchTerm, packages, "title"));

async function queryPackages(searchTerm) {
  const { stdout, stderr } = await exec(
    "cd  alfred-sfdx; sfdx force:package:list"
  );

  let sfdxOutputLines = stdout.split("\n");
  const separatorLine = sfdxOutputLines[2];
  const separatorLineGroups = separatorLine.match(
    /\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  sfdxOutputLines = sfdxOutputLines.slice(3);

  return sfdxOutputLines.map((line) => {
    const packageValues = [];
    let position = 0;
    for (let i = 1; i <= 6; i++) {
      const value = line.slice(
        position,
        position + separatorLineGroups[i].length + 2
      );
      packageValues.push(value.trim());
      position += separatorLineGroups[i].length + 2;
    }
    return {
      title:
        (packageValues[0] ? `${packageValues[0]}.` : "") + packageValues[1],
      subtitle: `Id: ${packageValues[2]}`,
      icon: { path: alfy.icon.get("SidebarGenericFolder") },
      arg: `sfdx:package:version ${packageValues[2]}`,
      mods: {
        alt: {
          subtitle: `Description: ${packageValues[4]}`,
        },
        cmd: {
          subtitle: `Type: ${packageValues[5]}`,
        },
        ctrl: {
          subtitle: `Alias: ${packageValues[3]}`,
        },
      },
    };
  });
}
