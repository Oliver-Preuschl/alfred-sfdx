const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(?:sfdx:org:connected)?\s*(\S*)/);
let searchTerm = inputGroups[1];

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
  const sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list",
    5,
    2,
    { endLineKeyword: "EXPIRATION DATE" }
  );

  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: `${properties[0]} ${properties[1]}`,
        subtitle: `Connection Status: ${properties[4]}`,
        arg: `sfdx:org:display ${properties[2]} `,
        icon: { path: alfy.icon.get("SidebariCloud") },
        mods: {
          alt: {
            subtitle: `[SET DEFAULT DEV HUB] UserName: ${properties[2]}`,
            arg: `sfdx:config:set:defaultdevhubusername ${properties[2]}`,
            icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          },
          cmd: {
            subtitle: `Org Id: ${properties[3]}`,
          },
          ctrl: {
            subtitle: `[OPEN] UserName: ${properties[2]}`,
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
