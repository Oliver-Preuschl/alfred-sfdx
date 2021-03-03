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
  const packageDefinitions = extractPackageDefinitions(data);
  return extractPackagNames(packageDefinitions);
}

function extractPackageDefinitions(data) {
  const regex = RegExp(
    '"packageDirectories"[\\s\\n\\r]*:[\\s\\n\\r]*\\[([\\s\\n\\r]*[\\s\\S]*)\\]',
    "g"
  );
  const [match] = data.matchAll(regex);
  return match[1];
}

function extractPackagNames(data) {
  const regex = RegExp('"package"\\s*:\\s*"(.*)"', "g");
  const matches = data.matchAll(regex);
  const packageNames = [];
  for (let match of matches) {
    packageNames.push(match[1]);
  }
  return packageNames;
}

exports.findFolderWithMatchingFileInWorkspace = findFolderWithMatchingFileInWorkspace;
exports.getPackagesForProject = getPackagesForProject;
