const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let orgId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:org:${orgId}:display`;
let orgDetails;
if (!alfy.cache.has(cacheKey)) {
  orgDetails = await queryOrgDisplay(alfy.input);
  alfy.cache.set(cacheKey, orgDetails, {
    maxAge: 300000,
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
  const separatorLineGroups = separatorLine.match(/(─*)\s*(─*)/);

  sfdxOutputLines = sfdxOutputLines.slice(5);

  return sfdxOutputLines
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
    return {
      title: packageVersionValues[1],
      subtitle: packageVersionValues[0],
      arg: packageVersionValues[1],
    };
  })
  .filter((item) => !!item.arg);
}
