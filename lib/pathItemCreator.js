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

function getPathItem(
  path = [],
  { description = "", hideHomeLink = false } = {}
) {
  return {
    title: path.join(" ▹ ").toUpperCase(),
    subtitle: description,
    icon: { path: "./icons/logo.png" },
    valid: false,
    mods: {
      ctrl: !hideHomeLink
        ? {
            title: "Home",
            subtitle: "Go to Start",
            icon: { path: "./icons/home-solid-grey.png" },
            arg: "",
            variables: { action: "sfdx:home" },
          }
        : {
            subtitle: description,
          },
      alt: {
        subtitle: description,
        valid: false,
      },
    },
  };
}

exports.getPathItem = getPathItem;
