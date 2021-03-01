const alfy = require("alfy");
const {
  findFolderWithMatchingFileInWorkspace,
} = require("./lib/fileSearch.js");

const inputGroups = alfy.input.match(
  /(?:sfdx:package:config:searchpath)?\s*(\S*)\s*(\S*)/
);
let packageId = inputGroups[1];
let searchTerm = inputGroups[2];

const configKey = `sfdx:package:${packageId}:config:path`;
const currentPath = alfy.config.get(configKey);
const currentPathItem = {
  title: "Current Project Path",
  subtitle: currentPath,
  icon: { path: alfy.icon.get("ToolbarInfo") },
};

const cacheKey = `sfdx:project:paths`;
let availablePaths;
if (!alfy.cache.has(cacheKey)) {
  availablePaths = await getAvailablePaths();
  alfy.cache.set(cacheKey, availablePaths, { maxAge: process.env.cacheMaxAge });
} else {
  availablePaths = alfy.cache.get(cacheKey);
}
alfy.output(
  addActions([
    currentPathItem,
    ...alfy.matches(searchTerm, enrichWithArg(availablePaths), "title"),
  ])
);

async function getAvailablePaths() {
  const sfdxProjectFolders = await findFolderWithMatchingFileInWorkspace(
    "sfdx-project.json"
  );
  return sfdxProjectFolders.map((sfdxProjectFolder) => ({
    title: sfdxProjectFolder,
    subtitle: `[SET] ${sfdxProjectFolder}`,
    icon: { path: alfy.icon.get("SidebarGenericFolder") },
    folder: sfdxProjectFolder,
  }));
}

function enrichWithArg(paths) {
  return paths.map((path) => ({
    ...path,
    arg: `sfdx:package:config:setpath ${packageId} ${path.folder}`,
  }));
}

function addActions(items) {
  const actions = [
    {
      title: "Back",
      subtitle: "Go to Start",
      icon: { path: alfy.icon.get("BackwardArrowIcon") },
      arg: `sfdx`,
    },
  ];
  return [...actions, ...items];
}
