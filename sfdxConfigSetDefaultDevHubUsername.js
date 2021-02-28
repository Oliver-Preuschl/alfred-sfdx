const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(
  /(?:sfdx:config:set:defaultdevhubusername)?\s*(\S*)/
);
let username = inputGroups[1];

const { stdout, stderr } = await exec(
  `cd  alfred-sfdx; sfdx force:config:set defaultdevhubusername=${username}`
);
alfy.cache.clear();
