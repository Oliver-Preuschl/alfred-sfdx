const alfy = require("alfy");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const { stdout, stderr } = await exec(
  `cd  alfred-sfdx; sfdx force:org:open --targetusername=${alfy.input}`
);
