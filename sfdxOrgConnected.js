const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let searchTerm = inputGroups[2];

const cacheKey = "sfdx:org:connected";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryOrgs(searchTerm);
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(addActions(alfy.matches(searchTerm, packages, "title")));

async function queryOrgs(searchTerm) {
  const { stdout, stderr } = await exec("cd  alfred-sfdx; sfdx force:org:list");

  let sfdxOutputLines = stdout.split("\n");

  const separatorLine = sfdxOutputLines[2];
  const separatorLineGroups = separatorLine.match(
    /\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  const scratchOrgFirstLineIndex = sfdxOutputLines.findIndex((line) =>
    line.includes("EXPIRATION DATE")
  );
  sfdxOutputLines = sfdxOutputLines.slice(3, scratchOrgFirstLineIndex - 1);

  return sfdxOutputLines
    .map((line) => {
      const properties = [];
      let position = 0;
      for (let i = 1; i <= 5; i++) {
        const value = line.slice(
          position,
          position + separatorLineGroups[i].length + 2
        );
        properties.push(value.trim());
        position += separatorLineGroups[i].length + 2;
      }
      return {
        title: `${properties[0]} ${properties[1]}`,
        subtitle: `Connection Status: ${properties[4]}`,
        arg: `sfdx:org:display ${properties[2]} `,
        icon: { path: alfy.icon.get("SidebariCloud") },
        mods: {
          alt: {
            subtitle: `UserName: ${properties[2]} (Action: Set as Default Dev Hub)`,
            arg: `sfdx:config:set:defaultdevhubusername ${properties[2]}`,
            icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          },
          cmd: {
            subtitle: `Alias: ${properties[1]}`,
          },
          ctrl: {
            subtitle: `OrgId: ${properties[3]} (Action: Open in Browser)`,
            arg: `sfdx:org:open ${properties[2]}`,
            icon: { path: alfy.icon.get("SidebarNetwork") },
          },
        },
      };
    })
    .filter((item) => !!item.title);
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
