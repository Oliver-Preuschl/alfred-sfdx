function getPathItem(
  path = [],
  { description = "", hideHomeLink = false } = {}
) {
  return {
    title: path.join(" ▹ ").toUpperCase(),
    subtitle: description,
    icon: { path: "./icn/sfdx.icns" },
    valid: false,
    mods: {
      ctrl: !hideHomeLink
        ? {
            title: "Home",
            subtitle: "Go to Start",
            icon: { path: "./icn/home-blue.icns" },
            arg: "",
            variables: { action: "sfdx:home" },
          }
        : {
            subtitle: description,
          },
      alt: {
        subtitle: description,
      },
    },
  };
}

exports.getPathItem = getPathItem;
