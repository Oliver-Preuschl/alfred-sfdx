const alfy = require("alfy");

const options = [
  {
    title: "project",
    arg: "sfdx:project ",
    icon: { path: "./icn/folder.icns" },
  },
  {
    title: "org:scratch",
    arg: "sfdx:org:scratch ",
    icon: { path: "./icn/cloud.icns" },
  },
  {
    title: "org:connected",
    arg: "sfdx:org:connected ",
    icon: { path: "./icn/cloud.icns" },
  },
  {
    title: "clearcache",
    arg: "sfdx:clearcache",
    icon: { path: "./icn/trash-o.icns" },
  },
];

if (alfy.cache.has("sfdx:lastviewedconfig")) {
  const lastViewedConfig = alfy.cache.get("sfdx:lastviewedconfig");
  options.unshift({
    title: lastViewedConfig.title,
    icon: { path: "./icn/history-solid.icns" },
    arg: "",
    variables: lastViewedConfig.variables,
  });
}

alfy.output(alfy.matches(alfy.input, options, "title"));
