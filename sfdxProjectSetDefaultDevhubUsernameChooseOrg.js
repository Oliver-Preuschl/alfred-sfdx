"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getConnectedOrgs } = require("./lib/sfdxDataLoader.js");

const { projectPath } = process.env;
const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Set"], {
  description: "Set Default Devhub Username",
  hideHomeLink: true,
});
const orgs = await getConnectedOrgs();
const orgItems = alfy.matches(
  searchTerm,
  getOrgItems(orgs, projectPath),
  "title"
);

alfy.output([pathItem, ...orgItems]);

function getOrgItems(orgs, projectPath) {
  return orgs
    .map((org) => {
      return {
        title: (org[""] ? `${org[""]} ` : "") + org["ALIAS"],
        subtitle: `Connection Status: ${org["CONNECTED STATUS"]}`,
        variables: {
          action: "sfdx:project:setdefaultdevhubusername",
          username: org["USERNAME"],
          projectPath,
        },
        icon: { path: "./icons/cloud-solid-blue.png" },
        mods: {
          ctrl: {
            subtitle: `Connection Status: ${org["CONNECTED STATUS"]}`,
          },
          alt: {
            subtitle: `Connection Status: ${org["CONNECTED STATUS"]}`,
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
