const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let packageVersionId = inputGroups[1];
let searchTerm = inputGroups[2];

const cacheKey = `sfdx:package:${packageVersionId}:report`;
let packageVersionReport;
if (!alfy.cache.has(cacheKey)) {
  packageVersionReport = await queryPackageVersionReport(packageVersionId);
  alfy.cache.set(cacheKey, packageVersionReport, {
    maxAge: 300000,
  });
} else {
  packageVersionReport = alfy.cache.get(cacheKey);
}
alfy.output(alfy.matches(searchTerm, packageVersionReport, "subtitle"));

async function queryPackageVersionReport(packageVersionId) {
  const { stdout, stderr } = await exec(
    `cd  alfred-sfdx; sfdx force:package:version:report --package=${packageVersionId}`
  );

  let sfdxOutputLines = stdout.split("\n");

  const separatorLine = sfdxOutputLines[2];
  const separatorLineGroups = separatorLine.match(/(─*)\s*(─*)/);

  sfdxOutputLines = sfdxOutputLines.slice(3);

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
