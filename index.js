const alfy = require("alfy");

const options = [
  {
    title: "sfdx:org:scratch",
    arg: "sfdx:org:scratch ",
    icon: { path: alfy.icon.get("SidebariCloud") },
  },
  {
    title: "sfdx:org:connected",
    arg: "sfdx:org:connected ",
    icon: { path: alfy.icon.get("SidebariCloud") },
  },
  {
    title: "sfdx:package",
    arg: "sfdx:package ",
    icon: { path: alfy.icon.get("SidebarGenericFolder") },
  },
  {
    title: "sfdx:clearcache",
    arg: "sfdx:clearcache",
    icon: { path: alfy.icon.get("ToolbarDeleteIcon") },
  },
];

alfy.output(alfy.matches(alfy.input, options, "title"));
