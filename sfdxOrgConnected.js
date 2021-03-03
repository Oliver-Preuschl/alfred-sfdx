const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(?:sfdx:org:connected)?\s*(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:connected";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list",
    5,
    2,
    {
      endLineKeyword: "EXPIRATION DATE",
      propertyNames: [
        "default",
        "alias",
        "username",
        "orgId",
        "connectionStatus",
      ],
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const packages = await queryOrgs(searchTerm);
alfy.output(addActions(alfy.matches(searchTerm, packages, "title")));

async function queryOrgs(searchTerm) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties.default ? `${properties.default} ` : "") +
          properties.alias,
        subtitle: `Connection Status: ${properties.connectionStatus}`,
        arg: `sfdx:org:display ${properties.username} `,
        icon: { path: alfy.icon.get("SidebariCloud") },
        mods: {
          alt: {
            subtitle: `[SET DEFAULT-DEV-HUB] "${properties.username}"`,
            arg: `sfdx:config:set:defaultdevhubusername ${properties.username}`,
            icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          },
          cmd: {
            subtitle: `Org Id: ${properties.orgId}`,
          },
          ctrl: {
            subtitle: `[OPEN] "${properties.username}"`,
            arg: `sfdx:org:open ${properties.username}`,
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
