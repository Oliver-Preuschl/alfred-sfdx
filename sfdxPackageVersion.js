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
    getPackageVersionItems(packageVersions, devhubUsername, projectPath),
    "title"
  )
  .sort((a, b) => (a.id > b.id ? -1 : 1));
alfy.output([pathItem, ...packageVersionItems]);

function getPackageVersionItems(packageVersions, devhubUsername, projectPath) {
  return packageVersions
    .map((packageVersion) => {
      const packageNameWithNamespace =
        (packageVersion.NamespacePrefix
          ? `${packageVersion.NamespacePrefix}.`
          : "") + packageVersion.Package2Name;
      const releasedStatus = packageVersion.IsReleased ? " (Released)" : "";
      return {
        title: `${packageNameWithNamespace} - ${packageVersion.Version}${releasedStatus}`,
        subtitle: `${packageVersion.SubscriberPackageVersionId}`,
        icon: { path: "./icons/gift-solid-red.png" },
        variables: {
          action: "sfdx:package:version:report",
          packageVersionId: packageVersion.SubscriberPackageVersionId,
          projectPath,
          devhubUsername,
          packageNameWithNamespace,
        },
        id: packageVersion.SubscriberPackageVersionId,
        version: packageVersion.Version,
        mods: {
          ctrl: {
            subtitle: `COPY Installation URL: /packaging/installPackage.apexp?p0=${packageVersion.SubscriberPackageVersionId}`,
            icon: { path: "./icons/copy-solid-red.png" },
            variables: {
              action: "sfdx:copy",
              value: `/packaging/installPackage.apexp?p0=${packageVersion.SubscriberPackageVersionId}`,
            },
          },
          alt: {
            subtitle: "PROMOTE",
            icon: { path: "./icons/glass-cheers-solid-red.png" },
            variables: {
              action: "sfdx:package:version:promote",
              packageVersionId: packageVersion.SubscriberPackageVersionId,
              projectPath,
            },
          },
          cmd: {
            subtitle: `${packageVersion.SubscriberPackageVersionId}`,
          },
        },
      };
    })
    .filter((item) => !!item.id);
}
