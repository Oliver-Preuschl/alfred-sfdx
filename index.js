const alfy = require("alfy");

const options = [
  {
    title: "sfdx:org:scratch",
    arg: "sfdx:org:scratch ",
  },
  {
    title: "sfdx:org:connected",
    arg: "sfdx:org:connected ",
  },
  {
    title: "sfdx:package",
    arg: "sfdx:package ",
  },
  {
    title: "sfdx:clearcache",
    arg: "sfdx:clearcache",
  },
];

alfy.output(alfy.matches(alfy.input, options, "title"));
