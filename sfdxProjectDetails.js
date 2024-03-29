/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const alfy = require("alfy");
const path = require("path");
const { getPathItem } = require("./lib/pathItemCreator.js");
const {
  getProjectPackages,
  getDefaultDevhubUsername,
} = require("./lib/sfdxDataLoader.js");

const { projectPath } = process.env;
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

const defaultDevhubUsername = await getDefaultDevhubUsername(projectPath);
const packages = await getProjectPackages(projectPath);
const linkedScratchOrgUsername = getLinkedScratchOrgUsername(projectPath);

const pathItem = getPathItem(["Project", "Details"], {
  description: projectDir,
});
const openProjectItem = getOpenProjectItem(projectPath, projectDir);
const defaultDevhubUsernameItem = getDefaultDevhubUsernameItem(
  defaultDevhubUsername,
  projectPath
);
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
  openProjectItem,
  defaultDevhubUsernameItem,
  packageCreateItem,
  ...packageItems,
  ...scratchOrgItems,
  ...pushPullActionItems,
]);

function getOpenProjectItem(projectPath, projectDir) {
  return {
    title: projectDir,
    subtitle: `OPEN "...${projectPath}"`,
    icon: { path: "./icons/eye-solid-green.png" },
    variables: {
      action: "sfdx:open:file",
      pathToOpen: projectPath,
    },
    valid: true,
    path: projectPath,
    mods: {
      ctrl: {
        subtitle: `OPEN "...${projectPath}/sfdx-project.json"`,
        icon: { path: "./icons/eye-solid-green.png" },
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

function getDefaultDevhubUsernameItem(defaultDevhubUsername, projectPath) {
  return {
    title: defaultDevhubUsername ? defaultDevhubUsername : "-",
    subtitle: "Default Dev Hub Username",
    icon: { path: "./icons/server-solid-green.png" },
    valid: false,
    mods: {
      ctrl: {
        subtitle: "SET Default Dev Hub Username",
        icon: { path: "./icons/wrench-solid-green.png" },
        variables: {
          action: "sfdx:project:setdefaultdevhubusername",
          projectPath,
        },
        valid: true,
      },
      alt: {
        subtitle: "Default Dev Hub Username",
        valid: false,
      },
    },
  };
}

function getPackageCreateItem(projectPath) {
  return {
    title: "Create Package",
    subtitle: "Create a new package for this project",
    icon: { path: "./icons/plus-circle-solid-red.png" },
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
      subtitle: "Show Package Versions",
      icon: { path: "./icons/gift-solid-red.png" },
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
          subtitle: "Create new Package Version",
          icon: { path: "./icons/plus-circle-solid-red.png" },
          variables: {
            action: "sfdx:project:package:version:create:enterpassword",
            projectPath,
            packageId: sfdxPackage.name,
          },
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
      icon: { path: "./icons/cloud-solid-blue.png" },
      variables: {
        action: "sfdx:org:display",
        username: linkedScratchOrgUsername,
      },
      valid: !!linkedScratchOrgUsername,
      mods: {
        ctrl: {
          subtitle: "CREATE Scratch Org",
          icon: { path: "./icons/plus-circle-solid-blue.png" },
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
          icon: { path: "./icons/link-solid-blue.png" },
          arg: "",
          variables: {
            action: "sfdx:project:scratchorg:link:chooseorg",
            projectPath,
          },
        },
        cmd: linkedScratchOrgUsername
          ? {
              subtitle: "UNLINK Scratch Org",
              icon: { path: "./icons/unlink-solid-blue.png" },
              arg: "",
              variables: {
                action: "sfdx:project:scratchorg:unlink",
                projectPath,
              },
            }
          : { subtitle: "Linked Scratch Org" },
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
        icon: { path: "./icons/cloud-upload-alt-solid-blue.png" },
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
        icon: { path: "./icons/cloud-download-alt-solid-blue.png" },
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
