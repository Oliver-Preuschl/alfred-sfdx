const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)\s*(\S*)/);
let packageVersionId = inputGroups[2];
let searchTerm = inputGroups[3];

const cacheKey = `sfdx:package:${packageVersionId}:report`;
let packageVersionReport;
if (!alfy.cache.has(cacheKey)) {
  packageVersionReport = await queryPackageVersionReport(packageVersionId);
  alfy.cache.set(cacheKey, packageVersionReport, {
    maxAge: process.env.cacheMaxAge,
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
  const separatorLineGroups = separatorLine.match(/\s*(─*)\s*(─*)/);

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
        icon:{path: alfy.icon.info},
        arg: packageVersionValues[1],
      };
    })
    .filter((item) => !!item.arg);
}
