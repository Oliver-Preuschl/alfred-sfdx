const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let searchTerm = inputGroups[2];

const cacheKey = "sfdx:package";
let packages;
if (!alfy.cache.has(cacheKey)) {
  packages = await queryPackages(searchTerm);
  alfy.cache.set(cacheKey, packages, { maxAge: 300000 });
} else {
  packages = alfy.cache.get(cacheKey);
}
alfy.output(alfy.matches(searchTerm, packages));

async function queryPackages(searchTerm) {
  const { stdout, stderr } = await exec(
    "cd  alfred-sfdx; sfdx force:package:list"
  );

  let packageLines = stdout.split("\n");
  const separatorLine = packageLines[2];
  const separatorLineGroups = separatorLine.match(
    /(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)\s*(─*)/
  );
  packageLines = packageLines.slice(3);

  return packageLines.map((line) => {
    const packageValues = [];
    let position = 0;
    for (let i = 1; i <= 6; i++) {
      const value = line.slice(
        position,
        position + separatorLineGroups[i].length
      );
      packageValues.push(value.trim());
      position += separatorLineGroups[i].length + 2;
    }
    return {
      title:
        (packageValues[0] ? `${packageValues[0]}.` : "") + packageValues[1],
      subtitle: packageValues[2],
      arg: packageValues[2],
      mods: {
        alt: {
          subtitle: packageValues[4],
        },
        cmd: {
          subtitle: packageValues[5],
        },
        ctrl: {
          subtitle: packageValues[3],
        },
      },
      quicklookurl: "https://www.salesforce.com",
    };
  });
}
