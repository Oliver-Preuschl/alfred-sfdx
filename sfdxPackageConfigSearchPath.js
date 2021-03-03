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
let availableProjectPathItems;
if (!alfy.cache.has(cacheKey)) {
  availableProjectPathItems = await getAvailableProjectPathItems();
  alfy.cache.set(cacheKey, availableProjectPathItems, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  availableProjectPathItems = alfy.cache.get(cacheKey);
}
alfy.output(
  addActions([
    currentPathItem,
    ...alfy.matches(
      searchTerm,
      enrichWithArg(availableProjectPathItems),
      "title"
    ),
  ])
);

async function getAvailableProjectPathItems() {
  const sfdxProjectFiles = await findFolderWithMatchingFileInWorkspace(
    "sfdx-project.json"
  );
  return sfdxProjectFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.folder,
      subtitle: `[SET] "${sfdxProjectFile.path}"`,
      icon: { path: alfy.icon.get("SidebarGenericFolder") },
      path: sfdxProjectFile.path,
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

function enrichWithArg(projectPathItems) {
  return projectPathItems.map((projectPathItem) => ({
    ...projectPathItem,
    arg: `sfdx:package:config:setpath ${packageId} ${projectPathItem.path}`,
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
