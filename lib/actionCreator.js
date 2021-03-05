"use strict";

function getGlobalActionItems() {
  return [
    {
      title: "Home",
      subtitle: "Go to Start",
      icon: { path: "./icn/home.icns" },
      arg: `sfdx`,
      mods: {
        ctrl: {
          subtitle: "Go to Start",
        },
        alt: {
          subtitle: "Go to Start",
        },
      },
    },
  ];
}

exports.getGlobalActionItems = getGlobalActionItems;
