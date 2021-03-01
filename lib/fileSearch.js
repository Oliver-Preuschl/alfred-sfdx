const alfy = require("alfy");
var path = require("path"),
  fs = require("fs");

function findFolderWithMatchingFileInWorkspace(filter) {
  return findFilesInWorkspace(filter).map((file) => file.replace(filter, ""));
}

function findFilesInWorkspace(filter) {
  const foundFiles = findFiles(process.env.workspace, filter);
  return foundFiles.map((file) => file.replace(process.env.workspace, ""));
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
      foundFiles.push(folderOrFilenameWithPath);
    }
  }
  return foundFiles;
}

exports.findFolderWithMatchingFileInWorkspace = findFolderWithMatchingFileInWorkspace;
