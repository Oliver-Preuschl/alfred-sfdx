"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getConnectedOrgs } = require("./lib/sfdxDataLoader.js");

let searchTerm = alfy.input;

const pathItem = getPathItem(["Orgs (Connected)"]);
const orgs = await getConnectedOrgs();
const orgItems = alfy.matches(searchTerm, getOrgItems(orgs), "title");
alfy.output([pathItem, ...orgItems]);

function getOrgItems(orgs) {
  return orgs
    .map((org) => {
      return {
        title: (org[""] ? `${org[""]} ` : "") + org["ALIAS"],
        subtitle: `Connection Status: ${org["CONNECTED STATUS"]}`,
        variables: {
          action: "sfdx:org:display",
          username: org["USERNAME"],
        },
        icon: { path: "./icn/cloud.icns" },
        mods: {
          ctrl: {
            subtitle: `OPEN "${org["USERNAME"]}"`,
            icon: { path: "./icn/external-link.icns" },
            variables: {
              action: "sfdx:org:open",
              value: org["USERNAME"],
            },
          },
          alt: {
            subtitle: `SHOW Packages`,
            variables: {
              action: "sfdx:project:package:list",
              devhubUsername: org["USERNAME"],
            },
            icon: { path: "./icn/gift.icns" },
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
