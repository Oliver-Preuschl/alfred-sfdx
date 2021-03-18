function getPathItem(
  path = [],
  { description = "", redirectArg = "", redirectVariables = {} } = {}
) {
  return {
    title: path.join(" ▹ ").toUpperCase(),
    subtitle: description,
    icon: { path: "./icn/sfdx.icns" },
    valid: false,
    mods: {
      ctrl: {
        title: "Home",
        subtitle: "Go to Start",
        icon: { path: "./icn/home-blue.icns" },
        arg: "",
        variables: { action: "sfdx:home" },
      },
      alt: {
        subtitle: description,
      },
    },
  };
}

exports.getPathItem = getPathItem;
