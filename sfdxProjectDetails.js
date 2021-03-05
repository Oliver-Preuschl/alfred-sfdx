"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getPackagesForProject } = require("./lib/fileSearcher.js");

const inputGroups = alfy.input.match(/"(.*)"\s*(\S*)/);
let projectPath = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:project:${projectPath}:details`;
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await getPackagesForProject(
    process.env.workspace + "/" + projectPath
  );
  alfy.cache.set(cacheKey, packages, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  packages = alfy.cache.get(cacheKey);
}
const actionItems = [...getGlobalActionItems(), ...getActionItems()];
const packageItems = await getPackageItems(packages);
const scratchOrgItems = await getScratchOrgItem(projectPath);
alfy.output([...actionItems, ...packageItems, ...scratchOrgItems]);

async function getPackageItems(packages) {
  return packages
    .map((sfdxPackage) => ({
      title: sfdxPackage.name,
      subtitle: "Package",
      icon: { path: "./icn/info-circle.icns" },
      mods: {
        ctrl: {
          subtitle: "[COPY] Package",
          icon: { path: "./icn/copy.icns" },
          arg: sfdxPackage.name,
        },
        alt: {
          subtitle:
            "Package Dependencies: " +
            sfdxPackage.dependencies
              .map((packageDependency) => packageDependency.package)
              .join(", "),
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

async function getScratchOrgItem(projectPath) {
  let assignedScratchOrg;
  const configKey = `sfdx:project:${projectPath}:assignedscratchorg`;
  if (alfy.config.has(configKey)) {
    assignedScratchOrg = alfy.config.get(configKey);
  }
  return [
    {
      title: assignedScratchOrg ? assignedScratchOrg : "NOT ASSIGNED",
      subtitle: "Assigned Scratch Org",
      icon: { path: "./icn/cloud.icns" },
      mods: {
        ctrl: {
          title: assignedScratchOrg ? assignedScratchOrg : "NOT ASSIGNED",
          subtitle: "[ASSIGN] Scratch Org",
          icon: { path: "./icn/gear.icns" },
          arg: `sfdx:project:searchscratchorg "${projectPath}" `,
        },
        alt: {
          subtitle: "[COPY] Assigned Scratch Org",
        },
      },
    },
  ];
}

function getActionItems() {
  return [
    {
      title: "Push",
      subtitle: "[PUSH METADATA]",
      icon: { path: "./icn/cloud-upload.icns" },
      arg: `sfdx`,
      mods: {
        ctrl: {
          subtitle: "[PUSH METADATA]",
        },
        alt: {
          subtitle: "[PUSH METADATA]",
        },
      },
    },
    {
      title: "Pull",
      subtitle: "[PULL METADATA]",
      icon: { path: "./icn/cloud-download.icns" },
      arg: `sfdx`,
      mods: {
        ctrl: {
          subtitle: "[PULL METADATA]",
        },
        alt: {
          subtitle: "[PULL METADATA]",
        },
      },
    },
  ];
}
