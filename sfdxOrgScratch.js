const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { getSfdxPropertyLines } = require("./lib/sfdxExecutor.js");

const inputGroups = alfy.input.match(/(\S*)/);
let searchTerm = inputGroups[1];

const cacheKey = "sfdx:org:scratch";
let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    "cd  alfred-sfdx; sfdx force:org:list --verbose",
    8,
    1,
    {
      startLineKeyword: "EXPIRATION DATE",
      propertyNames: [
        "alias",
        "username",
        "orgId",
        "status",
        "devHub",
        "createdDate",
        "instanceUrl",
        "expirationDate",
      ],
    }
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const actionItems = await getActionItems();
const orgItems = alfy.matches(
  searchTerm,
  await getOrgItems(searchTerm),
  "title"
);

alfy.output([...actionItems, ...orgItems]);

async function getOrgItems(searchTerm) {
  return sfdxPropertyLines
    .map((properties) => {
      return {
        title: properties.alias,
        subtitle: `${properties.status} (Expiration Date: ${properties.expirationDate})`,
        arg: `sfdx:org:display ${properties.username} `,
        icon: { path: alfy.icon.get("SidebariCloud") },
        mods: {
          alt: {
            subtitle: `OrgId: ${properties.orgId}`,
          },
          cmd: {
            subtitle: `Instance URL: ${properties.instanceUrl}`,
          },
          ctrl: {
            subtitle: `[OPEN] "${properties.username}"`,
            arg: `sfdx:org:open ${properties.username}`,
            icon: { path: alfy.icon.get("SidebarNetwork") },
          },
        },
      };
    })
    .filter((item) => !!item.title);
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
