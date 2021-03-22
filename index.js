const alfy = require("alfy");

const options = [
  {
    title: "Projects",
    arg: "sfdx:project ",
    icon: { path: "./icn/folder.icns" },
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
    icon: { path: "./icn/cloud.icns" },
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
    icon: { path: "./icn/cloud.icns" },
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
    icon: { path: "./icn/trash-o.icns" },
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
    icon: { path: "./icn/history-solid.icns" },
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
