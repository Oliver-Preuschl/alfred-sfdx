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
    1,
    {
      startLineKeyword: "EXPIRATION DATE",
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
  await getOrgItems(sfdxPropertyLines),
  "title"
);

alfy.output([...actionItems, ...orgItems]);

async function getOrgItems(sfdxPropertyLines) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties["ALIAS"],
        subtitle: `${properties["STATUS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
        arg: `sfdx:org:display ${properties["USERNAME"]} `,
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `[OPEN] "${properties["USERNAME"]}"`,
            icon: { path: "./icn/external-link.icns" },
            arg: `sfdx:org:open ${properties["USERNAME"]}`,
          },
          alt: {
            subtitle: `[COPY] OrgId: ${properties["ORG ID"]}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties["ORG ID"],
          },
          cmd: {
            subtitle: `[COPY] Instance URL: ${properties["INSTANCE URL"]}`,
            icon: { path: "./icn/copy.icns" },
            arg: properties["INSTANCE URL"],
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
