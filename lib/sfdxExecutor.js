const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getSfdxPropertyLines = async (
  command,
  columnCount,
  separatorLineIndex
) => {
  const { stdout, stderr } = await exec(command);
  let sfdxOutputLines = stdout.split("\n");
  const separatorLine = sfdxOutputLines[separatorLineIndex];
  const separatorLineGroups = getSeparatorLineGroups(
    separatorLine,
    columnCount
  );
  return getPropertyLines(
    sfdxOutputLines.slice(separatorLineIndex + 1),
    separatorLineGroups,
    columnCount
  );
};

const getSeparatorLineGroups = (separatorLine, columnCount) => {
  const pattern = "\\s*" + "(─*)\\s*".repeat(columnCount - 1) + "(─*)";
  return separatorLine.match(new RegExp(pattern));
};

const getPropertyLines = (lines, separatorLineGroups, columnCount) => {
  return lines.map((line) => {
    const properties = [];
    let position = 0;
    for (let i = 1; i <= columnCount; i++) {
      const value = line.slice(
        position,
        position + separatorLineGroups[i].length + 2
      );
      properties.push(value.trim());
      position += separatorLineGroups[i].length + 2;
    }
    return properties;
  });
};

exports.getSfdxPropertyLines = getSfdxPropertyLines;
