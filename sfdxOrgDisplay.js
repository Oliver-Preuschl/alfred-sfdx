const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)\s*(\S*)/);
let orgId = inputGroups[2];
let searchTerm = inputGroups[3];

let username;
let isDevHubAvailable = false;
let isConnectedStatusAvailable = false;

const cacheKey = `sfdx:org:${orgId}:display`;
let orgDetails;
if (!alfy.cache.has(cacheKey)) {
  orgDetails = await queryOrgDisplay(orgId);
  alfy.cache.set(cacheKey, orgDetails, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  orgDetails = alfy.cache.get(cacheKey);
}
alfy.output(addActions(alfy.matches(searchTerm, orgDetails, "subtitle")));

async function queryOrgDisplay(orgId) {
  const sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:org:display --targetusername=${orgId} --verbose`,
    2,
    4
  );
  return sfdxPropertyLines
    .map((properties) => {
      if (properties[0] === "Username") {
        username = properties[1];
      } else if (properties[0] === "Dev Hub Id") {
        isDevHubAvailable = true;
      } else if (properties[0] === "Connected Status") {
        isConnectedStatusAvailable = true;
      }
      return {
        title: properties[1],
        subtitle: properties[0],
        icon: { path: alfy.icon.info },
        arg: properties[1],
      };
    })
    .filter((item) => !!item.arg);
}

function addActions(items) {
  const actions = [
    {
      title: "Back",
      subtitle: "Go to Start",
      icon: { path: alfy.icon.get("BackwardArrowIcon") },
      arg: `sfdx`,
    },
    {
      title: "Open",
      subtitle: "Open Org in Browser",
      icon: { path: alfy.icon.get("SidebarNetwork") },
      arg: `sfdx:org:open ${username}`,
    },
  ];
  if (!isDevHubAvailable && !isConnectedStatusAvailable) {
    actions.push({
      title: "Set as Default",
      subtitle: "Set as Default Dev Hub",
      icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
      arg: `sfdx:config:set:defaultdevhubusername ${username}`,
    });
  }
  return [...actions, ...items];
}
