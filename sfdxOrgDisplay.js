const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)\s*(\S*)/);
let orgId = inputGroups[2];
let searchTerm = inputGroups[3];

const cacheKey = `sfdx:org:${orgId}:display`;
let orgDetails;
if (!alfy.cache.has(cacheKey)) {
  orgDetails = await queryOrgDisplay(orgId);
  alfy.cache.set(cacheKey, orgDetails, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  orgDetails = alfy.cache.get(cacheKey);
}
alfy.output(alfy.matches(searchTerm, orgDetails, "subtitle"));

async function queryOrgDisplay(orgId) {
  const { stdout, stderr } = await exec(
    `cd  alfred-sfdx; sfdx force:org:display --targetusername=${orgId} --verbose`
  );

  let sfdxOutputLines = stdout.split("\n");

  const separatorLine = sfdxOutputLines[4];
  const separatorLineGroups = separatorLine.match(/\s*(─*)\s*(─*)/);

  sfdxOutputLines = sfdxOutputLines.slice(5);

  let username;
  const details = sfdxOutputLines
    .map((line) => {
      const packageVersionValues = [];
      let position = 0;
      for (let i = 1; i <= 2; i++) {
        const value = line.slice(
          position,
          position + separatorLineGroups[i].length + 2
        );
        packageVersionValues.push(value.trim());
        position += separatorLineGroups[i].length + 2;
      }
      if (packageVersionValues[0] === "Username") {
        username = packageVersionValues[1];
      }
      return {
        title: packageVersionValues[1],
        subtitle: packageVersionValues[0],
        icon: { path: alfy.icon.info },
        arg: packageVersionValues[1],
      };
    })
    .filter((item) => !!item.arg);
  const actions = [
    {
      title: "Open",
      subtitle: "Open Org in Browser",
      icon: { path: alfy.icon.get("RightContainerArrowIcon") },
      arg: `sfdx:org:open ${username}`,
    },
  ];
  return [...actions, ...details];
}
