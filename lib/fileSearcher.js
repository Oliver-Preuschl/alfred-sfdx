const alfy = require("alfy");
var path = require("path"),
  fs = require("fs");

function findFolderWithMatchingFileInWorkspace(filter) {
  return findFilesInWorkspace(filter);
}

function findFilesInWorkspace(filter) {
  const foundFiles = findFiles(process.env.workspace, filter);
  return foundFiles.map(({ file, folder, path }) => ({
    file,
    folder,
    path: path.replace(process.env.workspace, ""),
  }));
}

function findFiles(
  currentPath,
  filter,
  maxDepth = process.env.workspaceProjectSearchDepth || 5,
  currentDepth = 0
) {
  if (!fs.existsSync(currentPath)) {
    console.log("no dir ", currentPath);
    return [];
  }
  if (currentDepth > maxDepth) {
    return [];
  }
  var foldersAndFileNames = fs.readdirSync(currentPath);
  let foundFiles = [];
  for (let folderOrFilename of foldersAndFileNames) {
    const folderOrFilenameWithPath = path.join(currentPath, folderOrFilename);
    var stat = fs.lstatSync(folderOrFilenameWithPath);
    if (stat.isDirectory()) {
      const nextLevelFoundFiles = findFiles(
        folderOrFilenameWithPath,
        filter,
        maxDepth,
        currentDepth + 1
      );
      if (nextLevelFoundFiles.length > 0) {
        foundFiles = foundFiles.concat(nextLevelFoundFiles);
      }
    } else if (folderOrFilenameWithPath.indexOf(filter) >= 0) {
      const fullPath = path.parse(folderOrFilenameWithPath).dir;
      const pathFolders = fullPath.split(path.sep);
      const lastFolder = pathFolders[pathFolders.length - 1];
      foundFiles.push({
        file: folderOrFilename,
        folder: lastFolder,
        path: path.dirname(folderOrFilenameWithPath),
      });
    }
  }
  return foundFiles;
}

function getPackagesForProject(projectFolder) {
  const data = fs.readFileSync(projectFolder + "/sfdx-project.json", "utf8");
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

exports.findFolderWithMatchingFileInWorkspace = findFolderWithMatchingFileInWorkspace;
exports.getPackagesForProject = getPackagesForProject;
