function getPathItem(path = [], { description = "" } = {}) {
  return {
    title: path.join(" ▹ ").toUpperCase(),
    subtitle: description,
    icon: { path: "./icn/sfdx.icns" },
    valid: false,
    mods: {
      ctrl: {
        title: "Refresh",
        subtitle: "Refresh",
        icon: { path: "./icn/refresh.icns" },
        arg: "",
        variables: { action: "sfdx:self" },
      },
      alt: {
        title: "Home",
        subtitle: "Go to Start",
        icon: { path: "./icn/home-blue.icns" },
        arg: "",
        variables: { action: "sfdx:home" },
      },
    },
  };
}

exports.getPathItem = getPathItem;
