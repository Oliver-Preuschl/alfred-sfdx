"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const {
  getSfdxPropertyLines,
  getKey2PropertyLineFromPropertyLines,
} = require("./lib/sfdxExecutor.js");

const {
  projectPath,
  devHubUsername,
  packageVersionId,
  packageNameWithNamespace,
} = process.env;

const path = projectPath
  ? `${process.env.workspace}/${projectPath}`
  : "alfred-sfdx";
const targetDevHubUsernameArg = devHubUsername
  ? `--targetdevhubusername ${devHubUsername}`
  : "";
const searchTerm = alfy.input;

alfy.cache.set(
  "sfdx:lastviewedconfig",
  {
    title: "Package Version Details",
    subtitle: packageNameWithNamespace,
    variables: {
      action: "sfdx:package:version:report",
      projectPath,
      devHubUsername,
      packageVersionId,
      packageNameWithNamespace,
    },
  },
  { maxAge: process.env.cacheMaxAge }
);

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

const promotionItem = getPromotionItem(
  packageVersionDetailName2PackageVersionDetail
);

const installationUrlItem = getInstallationLinkItem(
  packageVersionDetailName2PackageVersionDetail
);

const pathItem = getPathItem(["Project", "Package", "Version", "Details"], {
  description: packageNameWithNamespace,
});
const packageVersionReportItems = alfy.matches(
  searchTerm,
  getPackageVersionReportItems(sfdxPropertyLines),
  "subtitle"
);

alfy.output([
  pathItem,
  promotionItem,
  installationUrlItem,
  ...packageVersionReportItems,
]);

function getPromotionItem(packageVersionDetailName2PackageVersionDetail) {
  return {
    title: "Promote",
    subtitle: "Promote this Version",
    icon: { path: "./icn/glass-cheers-solid.png" },
    arg: "",
    variables: {
      action: "sfdx:package:version:promote",
      packageVersionId: packageVersionDetailName2PackageVersionDetail.get(
        "Subscriber Package Version Id"
      )["Value"],
    },
    mods: {
      ctrl: {
        subtitle: "Promote this Version",
      },
      alt: {
        subtitle: "Promote this Version",
      },
    },
  };
}

function getInstallationLinkItem(
  packageVersionDetailName2PackageVersionDetail
) {
  return {
    title: `/packaging/installPackage.apexp?p0=${
      packageVersionDetailName2PackageVersionDetail.get(
        "Subscriber Package Version Id"
      )["Value"]
    }`,
    subtitle: "Installation URL",
    icon: { path: "./icn/link.icns" },
    arg: "",
    mods: {
      ctrl: {
        subtitle: "COPY Installation URL",
        icon: { path: "./icn/copy.icns" },
        variables: {
          action: "sfdx:copy",
          value: `COPY /packaging/installPackage.apexp?p0=${
            packageVersionDetailName2PackageVersionDetail.get(
              "Subscriber Package Version Id"
            )["Value"]
          }`,
        },
      },
      alt: {
        subtitle: "Installation URL",
      },
    },
  };
}

function getPackageVersionReportItems(packageVersionId) {
  return sfdxPropertyLines.map((properties) => {
    return {
      title: properties["Value"],
      subtitle: properties["Name"],
      icon: { path: "./icn/info-circle.icns" },
      mods: {
        ctrl: {
          subtitle: `COPY ${properties["Name"]}`,
          icon: { path: "./icn/copy.icns" },
        },
        alt: {
          subtitle: properties["Name"],
        },
      },
    };
  });
}
