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
