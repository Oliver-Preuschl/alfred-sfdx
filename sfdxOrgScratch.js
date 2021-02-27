const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let searchTerm = inputGroups[2];

const cacheKey = "sfdx:org:scratch";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryOrgs(searchTerm);
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(alfy.matches(searchTerm, packages, "title"));

async function queryOrgs(searchTerm) {
  const { stdout, stderr } = await exec("cd  alfred-sfdx; sfdx force:org:list");

  let sfdxOutputLines = stdout.split("\n");
  const scratchOrgFirstLineIndex = sfdxOutputLines.findIndex((line) =>
    line.includes("EXPIRATION DATE")
  );
  const separatorLine = sfdxOutputLines[scratchOrgFirstLineIndex + 1];
  const separatorLineGroups = separatorLine.match(
    /\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  sfdxOutputLines = sfdxOutputLines.slice(scratchOrgFirstLineIndex + 2);

  return sfdxOutputLines
    .map((line) => {
      const properties = [];
      let position = 0;
      for (let i = 1; i <= 4; i++) {
        const value = line.slice(
          position,
          position + separatorLineGroups[i].length + 2
        );
        properties.push(value.trim());
        position += separatorLineGroups[i].length + 2;
      }
      return {
        title: properties[0],
        subtitle: `Expiration Date: ${properties[3]}`,
        arg: `sfdx:org:display ${properties[1]} `,
        icon: { path: alfy.icon.get('SidebariCloud') },
        mods: {
          alt: {
            subtitle: `UserName: ${properties[1]}`,
            arg: `sfdx:org:open ${properties[1]}`,
            icon: { path: alfy.icon.get("RightContainerArrowIcon") },
          },
          cmd: {
            subtitle: `OrgId: ${properties[2]}`,
            arg: `sfdx:org:open ${properties[1]}`,
            icon: { path: alfy.icon.get("RightContainerArrowIcon") },
          },
          ctrl: {
            subtitle: `OrgId: ${properties[2]}`,
            arg: `sfdx:org:open ${properties[1]}`,
            icon: { path: alfy.icon.get("RightContainerArrowIcon") },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
