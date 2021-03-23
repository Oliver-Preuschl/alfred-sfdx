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
        icon: { path: "./icons/cloud-solid-blue.png" },
        mods: {
          ctrl: {
            subtitle: `OPEN Org`,
            icon: { path: "./icons/external-link-alt-solid-blue.png" },
            variables: {
              action: "sfdx:org:open",
              username: org["USERNAME"],
            },
          },
          alt: {
            subtitle: `COPY Username: "${org["USERNAME"]}"`,
            icon: { path: "./icons/copy-solid-blue.png" },
            variables: {
              action: "sfdx:copy",
              value: org["USERNAME"],
            },
          },
          cmd: {
            subtitle: `COPY Instance URL: ${org["INSTANCE URL"]}`,
            icon: { path: "./icons/copy-solid-blue.png" },
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
