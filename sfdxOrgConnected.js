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
const actionItems = getGlobalActionItems();
const orgItems = alfy.matches(searchTerm, await queryOrgs(searchTerm), "title");
alfy.output([...actionItems, ...orgItems]);

async function queryOrgs(searchTerm) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title:
          (properties.default ? `${properties.default} ` : "") +
          properties.alias,
        subtitle: `Connection Status: ${properties.connectionStatus}`,
        arg: `sfdx:org:display ${properties.username} `,
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `[OPEN] "${properties.username}"`,
            arg: `sfdx:org:open ${properties.username}`,
            icon: { path: "./icn/external-link.icns" },
          },
          alt: {
            subtitle: `[SET DEFAULT-DEV-HUB] "${properties.username}"`,
            arg: `sfdx:config:set:defaultdevhubusername ${properties.username}`,
            icon: { path: "./icn/gear.icns" },
          },
          cmd: {
            subtitle: `[COPY] Org Id: ${properties.orgId}`,
            icon: { path: "./icn/copy.icns" },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
