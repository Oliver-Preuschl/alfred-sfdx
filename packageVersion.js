const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const cacheKey = `sfdx:package:${alfy.input}:version`;
let packageVersions;
if (!alfy.cache.has(cacheKey)) {
  packageVersions = await queryPackageVersions(alfy.input);
  alfy.cache.set(cacheKey, packageVersions, {
    maxAge: 300000,
  });
} else {
  packageVersions = alfy.cache.get(cacheKey);
}
alfy.output(packageVersions.sort((a, b) => (a.id > b.id ? -1 : 1)));

async function queryPackageVersions(packageId) {
  const { stdout, stderr } = await exec(
    `cd  alfred-sfdx; sfdx force:package:version:list --packages=${packageId}`
  );

  let sfdxOutputLines = stdout.split("\n");
  const separatorLine = sfdxOutputLines[2];
  const separatorLineGroups = separatorLine.match(
    /(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  sfdxOutputLines = sfdxOutputLines.slice(3);

  return sfdxOutputLines
    .map((line) => {
      const packageVersionValues = [];
      let position = 0;
      for (let i = 1; i <= 12; i++) {
        const value = line.slice(
          position,
          position + separatorLineGroups[i].length + 2
        );
        packageVersionValues.push(value.trim());
        position += separatorLineGroups[i].length + 2;
      }
      return {
        title:
          (packageVersionValues[1] ? `${packageVersionValues[1]}.` : "") +
          packageVersionValues[0] +
          " - " +
          packageVersionValues[3],
        subtitle: packageVersionValues[4],
        arg: packageVersionValues[4],
        id: packageVersionValues[4],
        version: packageVersionValues[3],
        mods: {
          alt: {
            subtitle: `Released: ${packageVersionValues[7]}`,
          },
          cmd: {
            subtitle: `Ancestor: ${packageVersionValues[9]}`,
          },
          ctrl: {
            subtitle: `Key: ${packageVersionValues[6]}`,
          },
        },
      };
    })
    .filter((item) => !!item.arg);
}
