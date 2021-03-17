"use strict";

const alfy = require("alfy");
var path = require("path"),
  fs = require("fs");

function findDirsWithMatchingFileInWorkspace(filter) {
  return findFilesInWorkspace(filter);
}

function findFilesInWorkspace(filter) {
  const foundFiles = findFiles(
    process.env.workspace,
    filter,
    process.env.workspaceProjectSearchDepth || 5
  );
  return foundFiles.map(({ file, dir, path }) => ({
    file,
    dir,
    path: path.replace(process.env.workspace, ""),
  }));
}

function getPackagesForProject(projectDir) {
  const data = fs.readFileSync(projectDir + "/sfdx-project.json", "utf8");
  return extractPackages(data);
}

function extractPackages(data) {
  const parsePackageDetails = JSON.parse(data);
  const packages = [];
  if (parsePackageDetails.packageDirectories) {
    for (let packageDirectory of parsePackageDetails.packageDirectories) {
      if (packageDirectory.package) {
        const sfdxPackage = { name: packageDirectory.package };
        if (packageDirectory.dependencies) {
          sfdxPackage.dependencies = packageDirectory.dependencies;
        } else {
          sfdxPackage.dependencies = [];
        }
        packages.push(sfdxPackage);
      }
    }
  }
  return packages;
}

function getScratchOrgDefinitionFiles(configDir) {
  return findFiles(process.env.workspace + "/" + configDir, ".json", {
    maxDepth: 0,
    startPath: process.env.workspace,
  });
}

function findFiles(
  currentPath,
  filter,
  { maxDepth = 5, currentDepth = 0, startPath } = {}
) {
  if (!startPath) {
    startPath = currentPath;
  }
  if (!fs.existsSync(currentPath)) {
    return [];
  }
  if (currentDepth > maxDepth) {
    return [];
  }
  var dirAndFileNames = fs.readdirSync(currentPath);
  let foundFiles = [];
  for (let dirOrFilename of dirAndFileNames) {
    const dirOrFilePath = path.join(currentPath, dirOrFilename);
    var stat = fs.lstatSync(dirOrFilePath);
    if (stat.isDirectory()) {
      const nextLevelFoundFiles = findFiles(dirOrFilePath, filter, {
        maxDepth,
        currentDepth: currentDepth + 1,
        startPath,
      });
      if (nextLevelFoundFiles.length > 0) {
        foundFiles = foundFiles.concat(nextLevelFoundFiles);
      }
    } else if (dirOrFilePath.indexOf(filter) >= 0) {
      const dirPath = path.parse(dirOrFilePath).dir;
      const relativeDirPath = dirPath.replace(startPath, "");
      const dirPathParts = dirPath.split(path.sep);
      const dir = dirPathParts[dirPathParts.length - 1];
      foundFiles.push({
        path: path.dirname(dirOrFilePath),
        relativeDirPath,
        dir,
        file: dirOrFilename,
      });
    }
  }
  return foundFiles;
}

function getWorkspaceDirs() {
  let projectDirs = findNonSfdxProjectDirs(process.env.workspace, {
    maxDepth: process.env.workspaceProjectSearchDepth || 5,
  });
  projectDirs = projectDirs.sort((a, b) => (a.level < b.level ? -1 : 1));
  return projectDirs;
}

function findNonSfdxProjectDirs(
  currentPath,
  { maxDepth = 5, currentDepth = 0, startPath = null } = {}
) {
  if (!startPath) {
    startPath = currentPath;
  }
  if (
    !fs.existsSync(currentPath) ||
    !fs.lstatSync(currentPath).isDirectory() ||
    currentDepth > maxDepth
  ) {
    return [];
  }
  const dirAndFileNames = fs.readdirSync(currentPath);
  const isProjectDirectory = dirAndFileNames.some(
    (dirOrFileName) =>
      dirOrFileName === ".forceignore" ||
      dirOrFileName === "package.json" ||
      dirOrFileName === "sfdx-project.json" ||
      dirOrFileName.endsWith(".iml")
  );
  if (isProjectDirectory) {
    return [];
  }
  let foundDirs = [];

  const relativeCurrentPath = currentPath.replace(startPath, "");
  const currentPathParts = currentPath.split(path.sep);
  const currentDir = currentPathParts[currentPathParts.length - 1];
  if (currentDir.startsWith(".")) {
    return [];
  }
  foundDirs.push({
    path: currentPath,
    relativePath: relativeCurrentPath,
    dir: currentDir,
    level: currentDepth,
  });

  for (let dirOrFilename of dirAndFileNames) {
    const dirOrFilePath = path.join(currentPath, dirOrFilename);
    const stat = fs.lstatSync(dirOrFilePath);
    if (!stat.isDirectory()) {
      continue;
    }
    const nextLevelFoundFiles = findNonSfdxProjectDirs(dirOrFilePath, {
      maxDepth,
      currentDepth: currentDepth + 1,
      startPath,
    });
    if (nextLevelFoundFiles.length > 0) {
      foundDirs = foundDirs.concat(nextLevelFoundFiles);
    }
  }
  return foundDirs;
}

function getPotentialPackageDirs(relativeProjectPath) {
  const projectPath = `${process.env.workspace}/${relativeProjectPath}`;
  if (!fs.existsSync(projectPath)) {
    return [];
  }
  const potentialPackageDirectories = [];
  const dirAndFileNames = fs.readdirSync(projectPath);
  for (let dirOrFileName of dirAndFileNames) {
    const dirOrFilePath = path.join(projectPath, dirOrFileName);
    const stat = fs.lstatSync(dirOrFilePath);
    if (stat.isDirectory() && !dirOrFileName.startsWith(".")) {
      potentialPackageDirectories.push(dirOrFileName);
    }
  }
  return potentialPackageDirectories;
}

exports.findDirsWithMatchingFileInWorkspace = findDirsWithMatchingFileInWorkspace;
exports.getPackagesForProject = getPackagesForProject;
exports.getScratchOrgDefinitionFiles = getScratchOrgDefinitionFiles;
exports.getWorkspaceDirs = getWorkspaceDirs;
exports.getPotentialPackageDirs = getPotentialPackageDirs;
