const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getSfdxPropertyLines = async (
  command,
  columnCount,
  separatorLineIndex,
  { startLineKeyword, endLineKeyword, propertyNames } = {}
) => {
  let sfdxOutput;
  try {
    const { stdout, stderr } = await exec(command);
    sfdxOutput = stdout;
  } catch (e) {
    throw new Error("Please install SFDX");
  }
  let sfdxOutputLines = sfdxOutput.split("\n");
  if (startLineKeyword) {
    sfdxOutputLines = removeLinesFromStart(sfdxOutputLines, startLineKeyword);
  }
  if (endLineKeyword) {
    sfdxOutputLines = removeLinesFromEnd(sfdxOutputLines, endLineKeyword);
  }
  const separatorLine = sfdxOutputLines[separatorLineIndex];
  const separatorLineGroups = getSeparatorLineGroups(
    separatorLine,
    columnCount
  );
  return getPropertyLines(
    sfdxOutputLines.slice(separatorLineIndex + 1),
    separatorLineGroups,
    columnCount,
    propertyNames
  );
};

const getSeparatorLineGroups = (separatorLine, columnCount) => {
  const pattern = "\\s*" + "(─*)\\s*".repeat(columnCount - 1) + "(─*)";
  return separatorLine.match(new RegExp(pattern));
};

const removeLinesFromStart = (sfdxOutputLines, startLineKeyword) => {
  const scratchOrgFirstLineIndex = sfdxOutputLines.findIndex((line) =>
    line.includes(startLineKeyword)
  );
  return sfdxOutputLines.slice(scratchOrgFirstLineIndex);
};

const removeLinesFromEnd = (sfdxOutputLines, endLineKeyword) => {
  const scratchOrgFirstLineIndex = sfdxOutputLines.findIndex((line) =>
    line.includes(endLineKeyword)
  );
  return sfdxOutputLines.slice(0, scratchOrgFirstLineIndex - 1);
};

const getPropertyLines = (
  lines,
  separatorLineGroups,
  columnCount,
  propertyNames
) => {
  return lines.map((line) => {
    const properties = {};
    let position = 0;
    for (let i = 1; i <= columnCount; i++) {
      const value = line.slice(
        position,
        position + separatorLineGroups[i].length + 2
      );
      if (propertyNames && propertyNames[i - 1]) {
        const propertyName = propertyNames[i - 1];
        properties[propertyName] = value.trim();
      } else {
        properties[i - 1] = value.trim();
      }
      position += separatorLineGroups[i].length + 2;
    }
    return properties;
  });
};

const getKey2PropertyLineFromPropertyLines = (propertyLines, keyIndex) => {
  const key2PropertyLine = new Map();
  propertyLines.forEach((propertyLine) => {
    key2PropertyLine.set(propertyLine[keyIndex], propertyLine);
  });
  return key2PropertyLine;
};

exports.getSfdxPropertyLines = getSfdxPropertyLines;
exports.getKey2PropertyLineFromPropertyLines = getKey2PropertyLineFromPropertyLines;
