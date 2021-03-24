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

const alfy = require("alfy");

const options = [
  {
    title: "Projects",
    arg: "sfdx:project ",
    icon: { path: "./icons/folder-solid-green.png" },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  },
  {
    title: "Scratch Orgs",
    arg: "sfdx:org:scratch ",
    icon: { path: "./icons/cloud-solid-blue.png" },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  },
  {
    title: "Connected Orgs",
    arg: "sfdx:org:connected ",
    icon: { path: "./icons/cloud-solid-blue.png" },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  },
  {
    title: "Clear Cache",
    arg: "sfdx:clearcache",
    variables: {
      action: "sfdx:clearcache",
    },
    icon: { path: "./icons/trash-solid-red.png" },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  },
];

if (alfy.cache.has("sfdx:lastviewedconfig")) {
  const lastViewedConfig = alfy.cache.get("sfdx:lastviewedconfig");
  options.unshift({
    title: lastViewedConfig.title,
    subtitle: lastViewedConfig.subtitle,
    icon: { path: "./icons/history-solid.png" },
    arg: "",
    variables: lastViewedConfig.variables,
    mods: {
      ctrl: {
        subtitle: lastViewedConfig.subtitle,
      },
      alt: {
        subtitle: lastViewedConfig.subtitle,
      },
      cmd: {
        subtitle: lastViewedConfig.subtitle,
      },
    },
  });
}

alfy.output(alfy.matches(alfy.input, options, "title"));
