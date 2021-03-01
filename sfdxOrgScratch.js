const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(?:sfdx:org:scratch)?\s*(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:scratch";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryOrgs(searchTerm);
  alfy.cache.set(cacheKey, packages, { maxAge: process.env.cacheMaxAge });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(addActions(alfy.matches(searchTerm, packages, "title")));

async function queryOrgs(searchTerm) {
  const sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list --verbose",
    8,
    1,
    { startLineKeyword: "EXPIRATION DATE" }
  );

  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties[0],
        subtitle: `${properties[3]} (Expiration Date: ${properties[7]})`,
        arg: `sfdx:org:display ${properties[1]} `,
        icon: { path: alfy.icon.get("SidebariCloud") },
        mods: {
          alt: {
            subtitle: `OrgId: ${properties[2]}`,
          },
          cmd: {
            subtitle: `Instance URL: ${properties[6]}`,
          },
          ctrl: {
            subtitle: `[OPEN] Username: ${properties[1]}`,
            arg: `sfdx:org:open ${properties[1]}`,
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
