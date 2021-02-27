const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)\s*(\S*)/);
let packageId = inputGroups[2];
let searchTerm = inputGroups[3];

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
  const { stdout, stderr } = await exec(
    `cd  alfred-sfdx; sfdx force:package:version:list --packages=${packageId}`
  );

  let sfdxOutputLines = stdout.split("\n");
  const separatorLine = sfdxOutputLines[2];
  const separatorLineGroups = separatorLine.match(
    /\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  sfdxOutputLines = sfdxOutputLines.slice(3);

  return sfdxOutputLines
    .map((line) => {
      const properties = [];
      let position = 0;
      for (let i = 1; i <= 12; i++) {
        const value = line.slice(
          position,
          position + separatorLineGroups[i].length + 2
        );
        properties.push(value.trim());
        position += separatorLineGroups[i].length + 2;
      }
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
