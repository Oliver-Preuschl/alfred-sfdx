const alfy = require("alfy");
const {
  findFolderWithMatchingFileInWorkspace,
} = require("./lib/fileSearch.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = `sfdx:project:paths`;
let sfdxProjectFiles;
if (!alfy.cache.has(cacheKey)) {
  sfdxProjectFiles = await findFolderWithMatchingFileInWorkspace(
    "sfdx-project.json"
  );
  alfy.cache.set(cacheKey, sfdxProjectFiles, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxProjectFiles = alfy.cache.get(cacheKey);
}
const actionsItems = getActionItems();
const projectPathItems = alfy.matches(
  searchTerm,
  await getAvailableProjectPathItems(sfdxProjectFiles),
  "title"
);
alfy.output([...actionsItems, ...projectPathItems]);

async function getAvailableProjectPathItems(sfdxProjectFiles) {
  return sfdxProjectFiles
    .map((sfdxProjectFile) => ({
      title: sfdxProjectFile.folder,
      subtitle: `...${sfdxProjectFile.path}`,
      icon: { path: alfy.icon.get("SidebarGenericFolder") },
      arg: `sfdx:project:details "${sfdxProjectFile.path}"`,
      path: sfdxProjectFile.path,
      mods: {
        ctrl: {
          title: sfdxProjectFile.folder,
          subtitle: `[OPEN] "...${sfdxProjectFile.path}/sfdx-project.json"`,
          icon: { path: alfy.icon.get("SidebarGenericFile") },
          arg: `sfdx:project:open:file ${sfdxProjectFile.path}/sfdx-project.json`,
        },
        alt: {
          title: sfdxProjectFile.folder,
          subtitle: `[OPEN] "...${sfdxProjectFile.path}"`,
          icon: { path: alfy.icon.get("SidebarGenericFolder") },
          arg: `sfdx:project:open:file ${sfdxProjectFile.path}`,
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

function getActionItems() {
  return [
    {
      title: "Back",
      subtitle: "Go to Start",
      icon: { path: alfy.icon.get("BackwardArrowIcon") },
      arg: `sfdx`,
    },
  ];
}
