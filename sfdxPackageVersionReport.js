/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const {
  getPackageVersionDetails,
  getAttributeList,
} = require("./lib/sfdxDataLoader.js");

const {
  projectPath,
  devhubUsername,
  packageVersionId,
  packageNameWithNamespace,
} = process.env;

const searchTerm = alfy.input;

alfy.cache.set(
  "sfdx:lastviewedconfig",
  {
    title: "Package Version Details",
    subtitle: packageNameWithNamespace,
    variables: {
      action: "sfdx:package:version:report",
      projectPath,
      devhubUsername,
      packageVersionId,
      packageNameWithNamespace,
    },
  },
  { maxAge: process.env.cacheMaxAge }
);

const packageVersionDetails = await getPackageVersionDetails(packageVersionId, {
  devhubUsername,
  relativeProjectPath: projectPath,
});

const pathItem = getPathItem(["Project", "Package", "Version", "Details"], {
  description: packageNameWithNamespace,
});
const promotionItem = getPromotionItem(packageVersionDetails, projectPath);
const installationUrlItem = getInstallationLinkItem(packageVersionDetails);
const packageVersionReportItems = alfy.matches(
  searchTerm,
  getPackageVersionReportItems(packageVersionDetails),
  "subtitle"
);

alfy.output([
  pathItem,
  promotionItem,
  installationUrlItem,
  ...packageVersionReportItems,
]);

function getPromotionItem(packageVersionDetails) {
  return {
    title: "Promote",
    subtitle: "Promote this Version",
    icon: { path: "./icons/glass-cheers-solid-red.png" },
    arg: "",
    variables: {
      action: "sfdx:package:version:promote",
      packageVersionId: packageVersionDetails.SubscriberPackageVersionId,
      projectPath,
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

function getInstallationLinkItem(packageVersionDetails) {
  return {
    title: `/packaging/installPackage.apexp?p0=${packageVersionDetails.SubscriberPackageVersionId}`,
    subtitle: "Installation URL",
    icon: { path: "./icons/link-solid-red.png" },
    arg: "",
    mods: {
      ctrl: {
        subtitle: "COPY Installation URL",
        icon: { path: "./icons/copy-solid-red.png" },
        variables: {
          action: "sfdx:copy",
          value: `/packaging/installPackage.apexp?p0=${packageVersionDetails.SubscriberPackageVersionId}`,
        },
      },
      alt: {
        subtitle: "Installation URL",
      },
    },
  };
}

function getPackageVersionReportItems(packageVersionDetails) {
  const packageVersionDetailKey2Value = getAttributeList(packageVersionDetails);
  return packageVersionDetailKey2Value.map((packageVersionDetail) => {
    return {
      title: packageVersionDetail.value,
      subtitle: packageVersionDetail.key,
      icon: { path: "./icons/info-circle-solid-red.png" },
      mods: {
        ctrl: {
          subtitle: `COPY ${packageVersionDetail.key}`,
          icon: { path: "./icons/copy-solid-red.png" },
        },
        alt: {
          subtitle: packageVersionDetail.key,
        },
      },
    };
  });
}
