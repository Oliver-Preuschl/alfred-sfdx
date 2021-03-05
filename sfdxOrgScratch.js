"use strict";

const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:scratch";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list --verbose",
    8,
    1,
    {
      startLineKeyword: "EXPIRATION DATE",
      propertyNames: [
        "alias",
        "username",
        "orgId",
        "status",
        "devHub",
        "createdDate",
        "instanceUrl",
        "expirationDate",
      ],
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const actionItems = await getGlobalActionItems();
const orgItems = alfy.matches(
  searchTerm,
  await getOrgItems(searchTerm),
  "title"
);

alfy.output([...actionItems, ...orgItems]);

async function getOrgItems(searchTerm) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties.alias,
        subtitle: `${properties.status} (Expiration Date: ${properties.expirationDate})`,
        arg: `sfdx:org:display ${properties.username} `,
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `[OPEN] "${properties.username}"`,
            icon: { path: "./icn/external-link.icns" },
            arg: `sfdx:org:open ${properties.username}`,
          },
          alt: {
            subtitle: `[COPY] OrgId: ${properties.orgId}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties.orgId,
          },
          cmd: {
            subtitle: `[COPY] Instance URL: ${properties.instanceUrl}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties.instanceUrl,
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
