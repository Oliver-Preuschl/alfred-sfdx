"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getScratchOrgs } = require("./lib/sfdxDataLoader.js");

const searchTerm = alfy.input;

const pathItem = getPathItem(["Orgs (Scratch)"]);
const orgs = await getScratchOrgs();
const orgItems = alfy.matches(searchTerm, getOrgItems(orgs), "title");

alfy.output([pathItem, ...orgItems]);

function getOrgItems(orgs) {
  return orgs
    .map((org) => {
      return {
        title: org["ALIAS"],
        subtitle: `${org["STATUS"]} (Expiration Date: ${org["EXPIRATION DATE"]})`,
        variables: {
          action: "sfdx:org:display",
          username: org["USERNAME"],
        },
        icon: { path: "./icn/cloud.png" },
        mods: {
          ctrl: {
            subtitle: `OPEN Org`,
            icon: { path: "./icn/external-link.png" },
            variables: {
              action: "sfdx:org:open",
              value: org["USERNAME"],
            },
          },
          alt: {
            subtitle: `COPY Username: "${org["USERNAME"]}"`,
            icon: { path: "./icn/copy.png" },
            variables: {
              action: "sfdx:copy",
              value: org["USERNAME"],
            },
          },
          cmd: {
            subtitle: `COPY Instance URL: ${org["INSTANCE URL"]}`,
            icon: { path: "./icn/copy.png" },
            variables: {
              action: "sfdx:copy",
              value: org["INSTANCE URL"],
            },
          },
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
