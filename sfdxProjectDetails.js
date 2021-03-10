"use strict";

const alfy = require("alfy");
const path = require("path");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const { getPackagesForProject } = require("./lib/fileSearcher.js");

let projectPath = process.env.projectPath;

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
const packageItems = await getPackageItems(packages, projectPath);
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
    valid: false,
    path: projectPath,
    mods: {
      ctrl: {
        subtitle: `OPEN "...${projectPath}/sfdx-project.json"`,
        icon: { path: "./icn/eye.icns" },
        variables: {
          action: "sfdx:open:file",
          pathToOpen: `${projectPath}/sfdx-project.json`,
        },
        valid: true,
      },
      alt: {
        subtitle: `OPEN "...${projectPath}"`,
        icon: { path: "./icn/eye.icns" },
        variables: {
          action: "sfdx:open:file",
          pathToOpen: projectPath,
        },
        valid: true,
      },
    },
  };
}

async function getPackageItems(packages, projectPath) {
  return packages
    .map((sfdxPackage) => ({
      title: sfdxPackage.name,
      subtitle: "Package",
      icon: { path: "./icn/gift.icns" },
      variables: {
        action: "sfdx:package:version",
        projectPath,
        packageId: sfdxPackage.name,
      },
      mods: {
        ctrl: {
          subtitle: `Package Dependencies: "${sfdxPackage.dependencies
            .map((packageDependency) => packageDependency.package)
            .join(", ")}"`,
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
      variables: {
        action: "sfdx:org:display",
        username: linkedScratchOrgUsername,
      },
      valid: !!linkedScratchOrgUsername,
      mods: {
        ctrl: {
          subtitle: "CREATE Scratch Org",
          icon: { path: "./icn/plus-circle.icns" },
          arg: "",
          variables: {
            action: "sfdx:project:searchscratchorgdefinition",
            projectPath,
          },
        },
        alt: {
          title: linkedScratchOrgUsername
            ? linkedScratchOrgUsername
            : "NOT LINKED",
          subtitle: "LINK Scratch Org",
          icon: { path: "./icn/link.icns" },
          arg: "",
          variables: {
            action: "sfdx:project:searchscratchorg",
            projectPath,
          },
        },
        cmd: {
          subtitle: "UNLINK Scratch Org",
          icon: { path: "./icn/unlink.icns" },
          arg: "",
          variables: {
            action: "sfdx:project:unlinkscratchorg",
            projectPath,
          },
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
        variables: {
          action: "sfdx:project:push",
          projectPath,
          username: linkedScratchOrgUsername,
        },
        mods: {
          ctrl: { subtitle: "" },
          alt: { subtitle: "" },
        },
      },
      {
        title: "Pull",
        subtitle: "",
        icon: { path: "./icn/cloud-download.icns" },
        variables: {
          action: "sfdx:project:pull",
          projectPath,
          username: linkedScratchOrgUsername,
        },
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
