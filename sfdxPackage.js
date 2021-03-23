"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getPackages } = require("./lib/sfdxDataLoader.js");

const { projectPath, devhubUsername } = process.env;
const searchTerm = alfy.input;

const packages = await getPackages(devhubUsername, {
  relativeProjectPath: projectPath,
});
const packageItems = alfy.matches(
  searchTerm,
  getPackageItems(packages, devhubUsername),
  "title"
);
const pathItem = projectPath
  ? getPathItem(["Project", "Packages"], { description: projectPath })
  : devhubUsername
  ? getPathItem(["Connected Org", "Packages"], { description: devhubUsername })
  : getPathItem(["Packages"]);
alfy.output([pathItem, ...packageItems]);

function getPackageItems(packages, devhubUsername) {
  return packages
    .map((singlePackage) => {
      return {
        title:
          (singlePackage["Namespace Prefix"]
            ? `${singlePackage["Namespace Prefix"]}.`
            : "") + singlePackage["Name"],
        subtitle: `Id: ${singlePackage["Id"]}`,
        icon: { path: "./icn/gift.png" },
        variables: {
          action: "sfdx:package:version",
          packageId: singlePackage["Id"],
          devhubUsername,
        },
        mods: {
          ctrl: {
            subtitle: `Id: "${singlePackage["Id"]}"`,
            icon: { path: "./icn/copy.png" },
            variables: {
              action: "sfdx:copy",
              packageId: singlePackage["Id"],
            },
          },
          alt: {
            subtitle: `Type: ${singlePackage["Type"]}`,
          },
          cmd: {
            subtitle: `Description: ${singlePackage["Description"]}`,
          },
        },
      };
    })
    .filter((line) => !!line.title);
}
