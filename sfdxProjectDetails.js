const alfy = require("alfy");
const { getPackagesForProject } = require("./lib/fileSearch.js");

const inputGroups = alfy.input.match(
  /(?:sfdx:project:details)?\s*"(.*)"\s*(\S*)/
);
let projectPath = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:project:${projectPath}:details`;
let packageNames;
if (!alfy.cache.has(cacheKey)) {
  packageNames = await getPackagesForProject(
    process.env.workspace + "/" + projectPath
  );
  alfy.cache.set(cacheKey, packageNames, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  packageNames = alfy.cache.get(cacheKey);
}
const items = await geItems(packageNames);
alfy.output(addActions(alfy.matches(searchTerm, items, "title")));

async function geItems(packageNames) {
  return packageNames
    .map((packageName) => ({
      title: packageName,
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
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
