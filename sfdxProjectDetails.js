const alfy = require("alfy");
const { getPackagesForProject } = require("./lib/fileSearch.js");

const inputGroups = alfy.input.match(/"(.*)"\s*(\S*)/);
let projectPath = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:project:${projectPath}:details`;
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
const actionItems = getActionItems();
const packageItems = await getPackageItems(packages);
const scratchOrgItems = await getScratchOrgItem(projectPath);
alfy.output([...actionItems, ...packageItems, ...scratchOrgItems]);

async function getPackageItems(packages) {
  return packages
    .map((sfdxPackage) => ({
      title: sfdxPackage.name,
      subtitle: "Package",
      icon: { path: alfy.icon.info },
      mods: {
        ctrl: {
          subtitle:
            "Package Dependencies: " +
            sfdxPackage.dependencies
              .map((packageDependency) => packageDependency.package)
              .join(", "),
          icon: { path: alfy.icon.info },
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

async function getScratchOrgItem(projectPath) {
  return [
    {
      title: "NOT ASSIGNED",
      subtitle: "Scratch Org",
      icon: { path: alfy.icon.get("SidebariCloud") },
      arg: `sfdx:project:searchscratchorg "${projectPath}" `,
      mods: {
        ctrl: {
          title: "NOT ASSIGNED",
          subtitle: "[ASSIGN] Scratch Org",
          icon: { path: alfy.icon.get("SidebarUtilitiesFolder") },
          arg: `sfdx:project:searchscratchorg "${projectPath}" `,
        },
      },
    },
  ];
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
