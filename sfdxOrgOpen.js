const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const inputGroups = alfy.input.match(/(\S*)\s*(\S*)/);
let username = inputGroups[2];

const { stdout, stderr } = await exec(
  `cd  alfred-sfdx; sfdx force:org:open --targetusername=${username}`
);
