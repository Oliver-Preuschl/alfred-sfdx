"use strict";

const alfy = require("alfy");
const { getGlobalActionItems } = require("./lib/actionCreator.js");
const {
  getSfdxPropertyLines,
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

const projectPath = process.env.projectPath;
const path = projectPath
  ? `${process.env.workspace}/${projectPath}`
  : "alfred-sfdx";
const devHubUsername = process.env.username;
const targetDevHubUsernameArg = devHubUsername
  ? `--targetdevhubusername ${devHubUsername}`
  : "";
let packageVersionId = process.env.packageVersionId;
const searchTerm = alfy.input;

const cacheKey = `sfdx:package:${packageVersionId}:report`;

let sfdxPropertyLines;
if (!alfy.cache.has(cacheKey)) {
  sfdxPropertyLines = await getSfdxPropertyLines(
    `cd "${path}"; sfdx force:package:version:report ${targetDevHubUsernameArg} --package=${packageVersionId}`,
    2
  );
  alfy.cache.set(cacheKey, sfdxPropertyLines, {
    maxAge: process.env.cacheMaxAge,
  });
} else {
  sfdxPropertyLines = alfy.cache.get(cacheKey);
}
const packageVersionDetailName2PackageVersionDetail = getKey2PropertyLineFromPropertyLines(
  sfdxPropertyLines,
  "Name"
);

const installationUrlItem = getInstallationLinkItem();

const actionItems = getGlobalActionItems();
const packageVersionReportItems = alfy.matches(
  searchTerm,
  await getPackageVersionReportItems(sfdxPropertyLines),
  "subtitle"
);

alfy.output([
  ...actionItems,
  installationUrlItem,
  ...packageVersionReportItems,
]);

async function getPackageVersionReportItems(packageVersionId) {
  return sfdxPropertyLines.map((properties) => {
    return {
      title: properties["Value"],
      subtitle: properties["Name"],
      icon: { path: "./icn/info-circle.icns" },
      mods: {
        ctrl: {
          subtitle: properties["Name"],
          icon: { path: "./icn/copy.icns" },
        },
        alt: {
          subtitle: properties["Name"],
          icon: { path: "./icn/copy.icns" },
        },
      },
    };
  });
}

function getInstallationLinkItem() {
  return {
    title: `/packaging/installPackage.apexp?p0=${
      packageVersionDetailName2PackageVersionDetail.get(
        "Subscriber Package Version Id"
      )["Value"]
    }`,
    subtitle: "Installation URL",
    arg: `/packaging/installPackage.apexp?p0=${
      packageVersionDetailName2PackageVersionDetail.get(
        "Subscriber Package Version Id"
      )["Value"]
    }`,
    icon: { path: "./icn/link.icns" },
    mods: {
      ctrl: {
        subtitle: "COPY Installation URL",
        arg: `/packaging/installPackage.apexp?p0=${
          packageVersionDetailName2PackageVersionDetail.get(
            "Subscriber Package Version Id"
          )["Value"]
        }`,
        icon: { path: "./icn/copy.icns" },
      },
      alt: {
        subtitle: "Installation URL",
      },
    },
  };
}
