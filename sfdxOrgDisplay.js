"use strict";

const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");
const {
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(?:sfdx:org:display)?\s*(\S*)\s*(\S*)/);
let orgId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:org:${orgId}:display`;
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd  alfred-sfdx; sfdx force:org:display --targetusername=${orgId} --verbose`,
    2,
    4,
    { propertyNames: ["key", "value"] }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const orgDetails = await buildOrgDetailItems(sfdxPropertyLines);
const orgDetailName2OrgDetail = getKey2PropertyLineFromPropertyLines(
  sfdxPropertyLines,
  "key"
);
const username = orgDetailName2OrgDetail.get("Username").value;
const isDevHubAvailable = orgDetailName2OrgDetail.has("Dev Hub Id");
const isConnectedStatusAvailable = orgDetailName2OrgDetail.has(
  "Connected Status"
);
const isDevHub = !isDevHubAvailable && !isConnectedStatusAvailable;

alfy.output(
  addActions(
    alfy.matches(searchTerm, orgDetails, "subtitle"),
    username,
    isDevHub
  )
);

async function buildOrgDetailItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties.value,
        subtitle: properties.key,
        icon: { path: alfy.icon.info },
        arg: properties.value,
      };
    })
    .filter((item) => !!item.arg);
}

function addActions(items, username, isDevHub) {
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
  if (isDevHub) {
    actions.push({
      title: "Set as Default",
      subtitle: "Set as Default Dev Hub",
      icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
      arg: `sfdx:config:set:defaultdevhubusername ${username}`,
    });
  }
  return [...actions, ...items];
}
