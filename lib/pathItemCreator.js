function getPathItem() {
  return {
    title: Array.prototype.slice.call(arguments).join(" ▹ ").toUpperCase(),
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
        subtitle: "",
      },
    },
  };
}

exports.getPathItem = getPathItem;
