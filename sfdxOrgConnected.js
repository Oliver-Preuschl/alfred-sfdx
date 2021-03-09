"use strict";

const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:connected";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list",
    1,
    {
      startLineKeyword: "CONNECTED STATUS",
      endLineKeyword: "EXPIRATION DATE",
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const actionItems = getGlobalActionItems();
const orgItems = alfy.matches(
  searchTerm,
  await getOrgItems(sfdxPropertyLines),
  "title"
);
alfy.output([...actionItems, ...orgItems]);

async function getOrgItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties[""] ? `${properties[""]} ` : "") + properties["ALIAS"],
        subtitle: `Connection Status: ${properties["CONNECTED STATUS"]}`,
        arg: `sfdx:org:display ${properties["USERNAME"]} `,
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `[OPEN] "${properties["USERNAME"]}"`,
            arg: `sfdx:org:open ${properties["USERNAME"]}`,
            icon: { path: "./icn/external-link.icns" },
          },
          alt: {
            subtitle: `[SET DEFAULT-DEV-HUB] "${properties["USERNAME"]}"`,
            arg: `sfdx:config:set:defaultdevhubusername ${properties["USERNAME"]}`,
            icon: { path: "./icn/gear.icns" },
          },
          cmd: {
            subtitle: `[COPY] Org Id: ${properties["ORG ID"]}`,
            icon: { path: "./icn/copy.icns" },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
