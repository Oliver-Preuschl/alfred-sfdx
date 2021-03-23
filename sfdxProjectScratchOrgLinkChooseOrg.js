"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getScratchOrgs } = require("./lib/sfdxDataLoader.js");

const projectPath = process.env.projectPath;
const searchTerm = alfy.input;

const scratchOrgs = await getScratchOrgs();
const pathItem = getPathItem(["Project", "Org (Scratch)", "Link"], {
  description: "Please choose Scratch Org",
  hideHomeLink: true,
});
const orgItems = await buildOrgItems(scratchOrgs, projectPath);
alfy.output([pathItem, ...alfy.matches(searchTerm, orgItems, "title")]);

async function buildOrgItems(scratchOrgs, projectPath) {
  return scratchOrgs
    .map((scratchOrg) => {
      return {
        title: scratchOrg["ALIAS"],
        subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
        icon: { path: "./icn/cloud.png" },
        arg: "",
        variables: {
          action: "sfdx:project:scratchorg:link",
          projectPath,
          username: scratchOrg["USERNAME"],
        },
        mods: {
          ctrl: {
            subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
          },
          alt: {
            subtitle: `${scratchOrg["ALIAS"]} (Expiration Date: ${scratchOrg["EXPIRATION DATE"]})`,
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
