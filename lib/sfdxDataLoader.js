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
const { execCommand } = require("./sfdxExecutor.js");
const {
  getWorkspaceDirs,
  findDirsWithMatchingFileInWorkspace,
  getPackagesForProject,
} = require("./fileSearcher.js");

const getWorkspacePaths = async () => {
  return await getWorkspaceDirs();
};

const getProjects = async () => {
  return await findDirsWithMatchingFileInWorkspace("sfdx-project.json");
};

const getProjectPackages = async (projectPath) => {
  const cacheKey = `sfdx:project:${projectPath}:packages`;
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
  return packages;
};

const getConnectedOrgs = async () => {
  const cacheKey = "sfdx:org:connected";
  let connectedOrgs;
  if (!alfy.cache.has(cacheKey)) {
    const salesforceOrgs = await execCommand(
      "cd alfred-sfdx; sfdx force:org:list --json"
    );
    connectedOrgs = salesforceOrgs.result.nonScratchOrgs;
    alfy.cache.set(cacheKey, connectedOrgs, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    connectedOrgs = alfy.cache.get(cacheKey);
  }
  return connectedOrgs;
};

const getScratchOrgs = async () => {
  const cacheKey = "sfdx:org:scratch";
  let scratchOrgs;
  if (!alfy.cache.has(cacheKey)) {
    const sfdxResponse = await execCommand(
      "cd alfred-sfdx; sfdx force:org:list --json"
    );
    scratchOrgs = sfdxResponse.result.scratchOrgs;
    alfy.cache.set(cacheKey, scratchOrgs, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    scratchOrgs = alfy.cache.get(cacheKey);
  }
  return scratchOrgs;
};

const getOrgDetails = async (targetUsername) => {
  const cacheKey = `sfdx:org:${targetUsername}:display`;
  let orgDetails;
  if (!alfy.cache.has(cacheKey)) {
    const sfdxResponse = await execCommand(
      `cd alfred-sfdx; sfdx force:org:display --targetusername=${targetUsername} --verbose --json`
    );
    orgDetails = sfdxResponse.result;
    alfy.cache.set(cacheKey, orgDetails, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    orgDetails = alfy.cache.get(cacheKey);
  }
  return orgDetails;
};

const getPackages = async (devhubUsername, { relativeProjectPath } = {}) => {
  const projectPath = relativeProjectPath
    ? `${process.env.workspace}/${relativeProjectPath}`
    : "alfred-sfdx";
  const cacheKey = `sfdx:package:${devhubUsername}`;
  let packages;
  if (!alfy.cache.has(cacheKey)) {
    const sfdxResponse = await execCommand(
      `cd "${projectPath}"; sfdx force:package:list --targetdevhubusername ${devhubUsername} --json`
    );
    packages = sfdxResponse.result;
    alfy.cache.set(cacheKey, packages, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    packages = alfy.cache.get(cacheKey);
  }
  return packages;
};

const getPackageVersions = async (
  packageId,
  { devhubUsername, relativeProjectPath } = {}
) => {
  const projectPath = relativeProjectPath
    ? `${process.env.workspace}/${relativeProjectPath}`
    : "alfred-sfdx";
  const targetDevhubUsernameArg = devhubUsername
    ? `--targetdevhubusername ${devhubUsername}`
    : "";
  const cacheKey = `sfdx:package:${packageId}:version`;
  let packageVersions;
  if (!alfy.cache.has(cacheKey)) {
    const sfdxResponse = await execCommand(
      `cd "${projectPath}"; sfdx force:package:version:list ${targetDevhubUsernameArg} --packages=${packageId} --json`
    );
    packageVersions = sfdxResponse.result;
    alfy.cache.set(cacheKey, packageVersions, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    packageVersions = alfy.cache.get(cacheKey);
  }
  return packageVersions;
};

const getPackageVersionDetails = async (
  packageVersionId,
  { devhubUsername, relativeProjectPath } = {}
) => {
  const projectPath = relativeProjectPath
    ? `${process.env.workspace}/${relativeProjectPath}`
    : "alfred-sfdx";
  const targetDevhubUsernameArg = devhubUsername
    ? `--targetdevhubusername ${devhubUsername}`
    : "";
  const cacheKey = `sfdx:package:${packageVersionId}:report`;
  let packageVersionDetails;
  if (!alfy.cache.has(cacheKey)) {
    const sfdxResponse = await execCommand(
      `cd "${projectPath}"; sfdx force:package:version:report ${targetDevhubUsernameArg} --package=${packageVersionId} --json`
    );
    packageVersionDetails = sfdxResponse.result;
    alfy.cache.set(cacheKey, packageVersionDetails, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    packageVersionDetails = alfy.cache.get(cacheKey);
  }
  return packageVersionDetails;
};

const getDefaultDevhubUsername = async (projectPath) => {
  let defaultDevhubUsername;
  try {
    const sfdxResponse = await execCommand(
      `cd "${process.env.workspace}/${projectPath}"; sfdx config:get defaultdevhubusername --json`
    );
    defaultDevhubUsername = sfdxResponse.result[0].value || "";
  } catch (e) {}
  return defaultDevhubUsername;
};

const getAttributeList = (object) => {
  let attributeList = [];
  for (const [key, value] of Object.entries(object)) {
    if (key !== "attributes") {
      if (typeof value === "object" && value !== null) {
        const childAttributeList = getAttributeList(value).map((attribute) => ({
          value: attribute.value ? attribute.value : "-",
          key: `${key} -> ${attribute.key}`,
        }));
        attributeList = attributeList.concat(childAttributeList);
      } else {
        attributeList.push({ key, value: value ? value : "-" });
      }
    }
  }
  return attributeList;
};

exports.getWorkspacePaths = getWorkspacePaths;

exports.getProjects = getProjects;
exports.getProjectPackages = getProjectPackages;

exports.getConnectedOrgs = getConnectedOrgs;
exports.getScratchOrgs = getScratchOrgs;
exports.getOrgDetails = getOrgDetails;

exports.getPackages = getPackages;
exports.getPackageVersions = getPackageVersions;
exports.getPackageVersionDetails = getPackageVersionDetails;

exports.getDefaultDevhubUsername = getDefaultDevhubUsername;

exports.getAttributeList = getAttributeList;
