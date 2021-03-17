"use strict";

const alfy = require("alfy");
const path = require("path");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getPackagesForProject } = require("./lib/fileSearcher.js");

let { projectPath } = process.env;
const projectPathParts = projectPath.split(path.sep);
const projectDir = projectPathParts[projectPathParts.length - 1];

alfy.cache.set(
  "sfdx:lastviewedconfig",
  {
    title: "Project Details",
    subtitle: projectPath,
    variables: {
      action: "sfdx:project:details",
      projectPath,
    },
  },
  { maxAge: process.env.cacheMaxAge }
);

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
const pathItem = getPathItem(["Project", "Details"], {
  description: projectDir,
});
const projectOpenItem = getProjectItem(projectPath, projectDir);
const packageCreateItem = await getPackageCreateItem(projectPath);
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
  pathItem,
  projectOpenItem,
  packageCreateItem,
  ...packageItems,
  ...scratchOrgItems,
  ...pushPullActionItems,
]);

function getProjectItem(projectPath, projectDir) {
  return {
    title: projectDir,
    subtitle: `OPEN "...${projectPath}"`,
    icon: { path: "./icn/eye.icns" },
    variables: {
      action: "sfdx:open:file",
      pathToOpen: projectPath,
    },
    valid: true,
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
      },
    },
  };
}

function getPackageCreateItem(projectPath) {
  return {
    title: "Create Package",
    subtitle: "Create a new package for this project",
    icon: { path: "./icn/plus-circle.icns" },
    variables: {
      action: "sfdx:project:package:create:choosefolder",
      projectPath,
    },
    mods: {
      ctrl: {
        subtitle: "Create a new package for this project",
      },
      alt: {
        subtitle: "Create a new package for this project",
      },
    },
  };
}

function getPackageItems(packages, projectPath) {
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
            action: "sfdx:project:scratchorg:create:choosedefinition",
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
            action: "sfdx:project:scratchorg:link:chooseorg",
            projectPath,
          },
        },
        cmd: {
          subtitle: "UNLINK Scratch Org",
          icon: { path: "./icn/unlink.icns" },
          arg: "",
          variables: {
            action: "sfdx:project:scratchorg:unlink",
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
