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
  getKeyValueMap,
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
const packageVersionDetailName2Value = getKeyValueMap(
  packageVersionDetails,
  "Name",
  "Value"
);

const pathItem = getPathItem(["Project", "Package", "Version", "Details"], {
  description: packageNameWithNamespace,
});
const promotionItem = getPromotionItem(
  packageVersionDetailName2Value,
  projectPath
);
const installationUrlItem = getInstallationLinkItem(
  packageVersionDetailName2Value
);
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

function getPromotionItem(packageVersionDetailName2Value) {
  return {
    title: "Promote",
    subtitle: "Promote this Version",
    icon: { path: "./icons/glass-cheers-solid-red.png" },
    arg: "",
    variables: {
      action: "sfdx:package:version:promote",
      packageVersionId: packageVersionDetailName2Value.get(
        "Subscriber Package Version Id"
      ),
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

function getInstallationLinkItem(packageVersionDetailName2Value) {
  return {
    title: `/packaging/installPackage.apexp?p0=${packageVersionDetailName2Value.get(
      "Subscriber Package Version Id"
    )}`,
    subtitle: "Installation URL",
    icon: { path: "./icons/link-solid-red.png" },
    arg: "",
    mods: {
      ctrl: {
        subtitle: "COPY Installation URL",
        icon: { path: "./icons/copy-solid-red.png" },
        variables: {
          action: "sfdx:copy",
          value: `COPY /packaging/installPackage.apexp?p0=${packageVersionDetailName2Value.get(
            "Subscriber Package Version Id"
          )}`,
        },
      },
      alt: {
        subtitle: "Installation URL",
      },
    },
  };
}

function getPackageVersionReportItems(packageVersionDetails) {
  return packageVersionDetails.map((packageVersionDetail) => {
    return {
      title: packageVersionDetail["Value"],
      subtitle: packageVersionDetail["Name"],
      icon: { path: "./icons/info-circle-solid-red.png" },
      mods: {
        ctrl: {
          subtitle: `COPY ${packageVersionDetail["Name"]}`,
          icon: { path: "./icons/copy-solid-red.png" },
        },
        alt: {
          subtitle: packageVersionDetail["Name"],
        },
      },
    };
  });
}
