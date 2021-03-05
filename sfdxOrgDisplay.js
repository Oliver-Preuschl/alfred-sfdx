"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const {
  getSfdxPropertyLines,
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
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
const globalActionsItems = getGlobalActionItems();
const orgDetailItems = alfy.matches(
  searchTerm,
  await getOrgDetailItems(sfdxPropertyLines),
  "subtitle"
);
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
const actionItems = getActionItems(username, isDevHub);

alfy.output([...globalActionsItems, ...actionItems, ...orgDetailItems]);

async function getOrgDetailItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties.value,
        subtitle: properties.key,
        icon: { path: "./icn/info-circle.icns" },
        arg: properties.value,
        mods: {
          ctrl: {
            subtitle: `[COPY] ${properties.key}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties.value,
          },
          alt: {
            subtitle: properties.key,
            icon: { path: "./icn/copy.icns" },
            arg: properties.value,
          },
        },
      };
    })
    .filter((item) => !!item.arg);
}

function getActionItems(username, isDevHub) {
  const actions = [
    {
      title: "Open",
      subtitle: "Open Org in Browser",
      icon: { path: "./icn/external-link.icns" },
      arg: `sfdx:org:open ${username}`,
      mods: {
        ctrl: {
          subtitle: "Open Org in Browser",
        },
        alt: {
          subtitle: "Open Org in Browser",
        },
      },
    },
  ];
  if (isDevHub) {
    actions.push({
      title: "Set as Default",
      subtitle: "Set as Default Dev Hub",
      icon: { path: "./icn/gear.icns" },
      arg: `sfdx:config:set:defaultdevhubusername ${username}`,
      mods: {
        ctrl: {
          subtitle: "Set as Default Dev Hub",
        },
        alt: {
          subtitle: "Set as Default Dev Hub",
        },
      },
    });
  }
  return actions;
}
