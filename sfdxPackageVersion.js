"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getPackageVersions } = require("./lib/sfdxDataLoader.js");

const { projectPath, packageId, devhubUsername } = process.env;

const searchTerm = alfy.input;

const pathItem = getPathItem(["Project", "Package", "Versions"], {
  description: packageId,
});
const packageVersions = await getPackageVersions(packageId, {
  devhubUsername,
  relativeProjectPath: projectPath,
});
const packageVersionItems = alfy
  .matches(
    searchTerm,
    getPackageVersionItems(packageVersions, devhubUsername),
    "title"
  )
  .sort((a, b) => (a.id > b.id ? -1 : 1));
alfy.output([pathItem, ...packageVersionItems]);

function getPackageVersionItems(packageVersions, devhubUsername) {
  return packageVersions
    .map((packageVersion) => {
      const packageNameWithNamespace =
        (packageVersion["Namespace"] ? `${packageVersion["Namespace"]}.` : "") +
        packageVersion["Package Name"];
      const releasedStatus =
        packageVersion["Released"] === "true" ? " (Released)" : "";
      return {
        title: `${packageNameWithNamespace} - ${packageVersion["Version"]}${releasedStatus}`,
        subtitle: `${packageVersion["Subscriber Package Version Id"]}`,
        icon: { path: "./icn/gift.png" },
        variables: {
          action: "sfdx:package:version:report",
          packageVersionId: packageVersion["Subscriber Package Version Id"],
          projectPath,
          devhubUsername,
          packageNameWithNamespace,
        },
        id: packageVersion["Subscriber Package Version Id"],
        version: packageVersion["Version"],
        mods: {
          ctrl: {
            subtitle: `COPY Installation URL: /packaging/installPackage.apexp?p0=${packageVersion["Subscriber Package Version Id"]}`,
            icon: { path: "./icn/copy.png" },
            variables: {
              action: "sfdx:copy",
              value: `/packaging/installPackage.apexp?p0=${packageVersion["Subscriber Package Version Id"]}`,
            },
          },
          alt: {
            subtitle: "PROMOTE",
            icon: { path: "./icn/glass-cheers-solid.png" },
            variables: {
              action: "sfdx:package:version:promote",
              packageVersionId: packageVersion["Subscriber Package Version Id"],
            },
          },
          cmd: {
            subtitle: `${packageVersion["Subscriber Package Version Id"]}`,
          },
        },
      };
    })
    .filter((item) => !!item.id);
}
