"use strict";

const alfy = require("alfy");
const path = require("path");
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
const linkedScratchOrgUsername = getLinkedScratchOrgUsername(projectPath);
const globalActionItems = getGlobalActionItems();
const projectItem = getProjectItem(projectPath);
const packageItems = await getPackageItems(packages);
const scratchOrgItems = await getScratchOrgItem(
  projectPath,
  linkedScratchOrgUsername
);
const pushPullActionItems = getActionPushPullActionItems(
  projectPath,
  linkedScratchOrgUsername
);
alfy.output([
  ...globalActionItems,
  projectItem,
  ...packageItems,
  ...scratchOrgItems,
  ...pushPullActionItems,
]);

function getProjectItem(projectPath) {
  const pathParts = projectPath.split(path.sep);
  const folder = pathParts[pathParts.length - 1];
  return {
    title: folder,
    subtitle: `...${projectPath}`,
    icon: { path: "./icn/folder.icns" },
    arg: `sfdx:project:details "${projectPath}"`,
    path: projectPath,
    mods: {
      ctrl: {
        subtitle: `[OPEN PROJECT FILE] "...${projectPath}/sfdx-project.json"`,
        icon: { path: "./icn/eye.icns" },
        arg: "sfdx:project:open:file",
        variables: {
          pathToOpen: `${projectPath}/sfdx-project.json`,
        },
      },
      alt: {
        subtitle: `[OPEN PROJECT FOLDER] "...${projectPath}"`,
        icon: { path: "./icn/eye.icns" },
        arg: "sfdx:project:open:file",
        variables: {
          pathToOpen: projectPath,
        },
      },
    },
  };
}

async function getPackageItems(packages) {
  return packages
    .map((sfdxPackage) => ({
      title: sfdxPackage.name,
      subtitle: "Package",
      icon: { path: "./icn/gift.icns" },
      mods: {
        ctrl: {
          subtitle:
            "Package Dependencies: " +
            sfdxPackage.dependencies
              .map((packageDependency) => packageDependency.package)
              .join(", "),
        },
        alt: {
          subtitle: "Package",
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

function getLinkedScratchOrgUsername(projectPath) {
  let linkedScratchOrgUsername;
  const configKey = `sfdx:project:${projectPath}:linkedscratchorg`;
  if (alfy.config.has(configKey)) {
    linkedScratchOrgUsername = alfy.config.get(configKey);
  }
  return linkedScratchOrgUsername;
}

async function getScratchOrgItem(projectPath, linkedScratchOrgUsername) {
  return [
    {
      title: linkedScratchOrgUsername ? linkedScratchOrgUsername : "NOT LINKED",
      subtitle: "Linked Scratch Org",
      icon: { path: "./icn/cloud.icns" },
      arg: `sfdx:org:display ${linkedScratchOrgUsername} `,
      mods: {
        ctrl: {
          subtitle: "[CREATE] Scratch Org",
          icon: { path: "./icn/plus-circle.icns" },
          arg: `sfdx:project:searchscratchorgdefinition "${projectPath}" `,
        },
        alt: {
          title: linkedScratchOrgUsername
            ? linkedScratchOrgUsername
            : "NOT LINKED",
          subtitle: "[Link] Scratch Org",
          icon: { path: "./icn/link.icns" },
          arg: `sfdx:project:searchscratchorg "${projectPath}" `,
        },
        cmd: {
          subtitle: "[Unlink] Scratch Org",
          icon: { path: "./icn/unlink.icns" },
          arg: `sfdx:project:unlinkscratchorg "${projectPath}" `,
        },
      },
    },
  ];
}

function getActionPushPullActionItems(projectPath, linkedScratchOrgUsername) {
  if (linkedScratchOrgUsername) {
    return [
      {
        title: "Push",
        subtitle: "",
        icon: { path: "./icn/cloud-upload.icns" },
        arg: `sfdx:project:push "${projectPath}" ${linkedScratchOrgUsername}`,
        mods: {
          ctrl: { subtitle: "" },
          alt: { subtitle: "" },
        },
      },
      {
        title: "Pull",
        subtitle: "",
        icon: { path: "./icn/cloud-download.icns" },
        arg: `sfdx:project:pull "${projectPath}" ${linkedScratchOrgUsername}`,
        mods: {
          ctrl: {
            subtitle: "",
          },
          alt: {
            subtitle: "",
          },
        },
      },
    ];
  } else {
    return [];
  }
}
