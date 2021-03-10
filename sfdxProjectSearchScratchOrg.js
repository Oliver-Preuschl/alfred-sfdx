"use strict";

const alfy = require("alfy");
const util = require("util");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const exec = util.promisify(require("child_process").exec);
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const projectPath = process.env.projectPath;
const searchTerm = alfy.input;

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
const actionItems = getGlobalActionItems();
const orgItems = await buildOrgItems(projectPath);
alfy.output([...actionItems, ...alfy.matches(searchTerm, orgItems, "title")]);

async function buildOrgItems(projectPath) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties["ALIAS"],
        subtitle: `[ASSIGN] ${properties["ALIAS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
        icon: { path: "./icn/cloud.icns" },
        arg: "",
        variables: {
          action: "sfdx:project:linkscratchorg",
          projectPath,
          username: properties["USERNAME"],
        },
        mods: {
          ctrl: {
            subtitle: `Username: "${properties["USERNAME"]}"`,
            icon: { path: "./icn/external-link.icns" },
            variables: {
              action: "sfdx:org:open",
              projectPath,
              username: properties["USERNAME"],
            },
          },
          alt: {
            subtitle: `OrgId: ${properties["ORG ID"]}`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              value: properties["ORG ID"],
            },
          },
          cmd: {
            subtitle: `Instance URL: ${properties["INSTANCE URL"]}`,
            icon: { path: "./icn/copy.icns" },
            variables: {
              action: "sfdx:copy",
              value: properties["INSTANCE URL"],
            },
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
