"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
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
const pathItem = getPathItem(["Project", "Org (Scratch)", "Link"], {
  description: "Please choose Scratch Org",
  hideHomeLink: true,
});
const orgItems = await buildOrgItems(projectPath);
alfy.output([pathItem, ...alfy.matches(searchTerm, orgItems, "title")]);

async function buildOrgItems(projectPath) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties["ALIAS"],
        subtitle: `${properties["ALIAS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
        icon: { path: "./icn/cloud.icns" },
        arg: "",
        variables: {
          action: "sfdx:project:scratchorg:link",
          projectPath,
          username: properties["USERNAME"],
        },
        mods: {
          ctrl: {
            subtitle: `${properties["ALIAS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
          },
          alt: {
            subtitle: `${properties["ALIAS"]} (Expiration Date: ${properties["EXPIRATION DATE"]})`,
          },
        },
      };
    })
    .filter((item) => !!item.title);
}
