"use strict";

const alfy = require("alfy");
const { getSfdxPropertyLines } = require("./sfdxExecutor.js");
const {
  getWorkspaceDirs,
  findDirsWithMatchingFileInWorkspace,
  getPackagesForProject,
} = require("./fileSearcher.js");

const getWorkspacePaths = async () => {
  const cacheKey = `sfdx:workspace:paths`;
  let sfdxWorkspacePaths;
  if (!alfy.cache.has(cacheKey)) {
    sfdxWorkspacePaths = await getWorkspaceDirs();
    alfy.cache.set(cacheKey, sfdxWorkspacePaths, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxWorkspacePaths = alfy.cache.get(cacheKey);
  }
  return sfdxWorkspacePaths;
};

const getProjects = async () => {
  const cacheKey = `sfdx:project:paths`;
  let sfdxProjectFiles;
  if (!alfy.cache.has(cacheKey)) {
    sfdxProjectFiles = await findDirsWithMatchingFileInWorkspace(
      "sfdx-project.json"
    );
    alfy.cache.set(cacheKey, sfdxProjectFiles, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxProjectFiles = alfy.cache.get(cacheKey);
  }
  return sfdxProjectFiles;
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
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = (
      await getSfdxPropertyLines("cd  alfred-sfdx; sfdx force:org:list", 1, {
        startLineKeyword: "CONNECTED STATUS",
        endLineKeyword: "EXPIRATION DATE",
      })
    ).filter((org) => !!org["USERNAME"]);
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
};

const getScratchOrgs = async () => {
  const cacheKey = "sfdx:org:scratch";
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = (
      await getSfdxPropertyLines(
        "cd  alfred-sfdx; sfdx force:org:list --verbose",
        1,
        {
          startLineKeyword: "EXPIRATION DATE",
        }
      )
    ).filter((org) => !!org["USERNAME"]);
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
};

const getOrgDetails = async (targetUsername) => {
  const cacheKey = `sfdx:org:${targetUsername}:display`;
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = await getSfdxPropertyLines(
      `cd  alfred-sfdx; sfdx force:org:display --targetusername=${targetUsername} --verbose`,
      4
    );
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
};

const getPackages = async (devhubUsername, { relativeProjectPath } = {}) => {
  const projectPath = relativeProjectPath
    ? `${process.env.workspace}/${relativeProjectPath}`
    : "alfred-sfdx";
  const cacheKey = `sfdx:package:${devhubUsername}`;
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = await getSfdxPropertyLines(
      `cd "${projectPath}"; sfdx force:package:list --targetdevhubusername ${devhubUsername}`,
      2
    );
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
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
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = await getSfdxPropertyLines(
      `cd "${projectPath}"; sfdx force:package:version:list ${targetDevhubUsernameArg} --packages=${packageId}`,
      2
    );
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
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
  let sfdxPropertyLines;
  if (!alfy.cache.has(cacheKey)) {
    sfdxPropertyLines = await getSfdxPropertyLines(
      `cd "${projectPath}"; sfdx force:package:version:report ${targetDevhubUsernameArg} --package=${packageVersionId}`,
      2
    );
    alfy.cache.set(cacheKey, sfdxPropertyLines, {
      maxAge: process.env.cacheMaxAge,
    });
  } else {
    sfdxPropertyLines = alfy.cache.get(cacheKey);
  }
  return sfdxPropertyLines;
};

const getKeyValueMap = (propertyLines, keyPropertyName, valuePropertyName) => {
  const key2Value = new Map();
  propertyLines.forEach((propertyLine) => {
    key2Value.set(
      propertyLine[keyPropertyName],
      propertyLine[valuePropertyName]
    );
  });
  return key2Value;
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

exports.getKeyValueMap = getKeyValueMap;
