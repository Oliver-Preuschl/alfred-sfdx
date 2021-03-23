const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getSfdxPropertyLines = async (
  command,
  separatorLineIndex,
  { startLineKeyword, endLineKeyword } = {}
) => {
  const { stdout, stderr } = await exec(command);
  let sfdxOutputLines = stdout.split("\n");
  if (startLineKeyword) {
    sfdxOutputLines = removeLinesFromStart(sfdxOutputLines, startLineKeyword);
  }
  if (endLineKeyword) {
    sfdxOutputLines = removeLinesFromEnd(sfdxOutputLines, endLineKeyword);
  }
  const headerLine = sfdxOutputLines[separatorLineIndex - 1];
  const separatorLine = sfdxOutputLines[separatorLineIndex];
  if (!separatorLine) {
    return [];
  }
  const headerColumnLengths = getHeaderColumnLengths(separatorLine);
  const headerColumns = getHeaderColumns(separatorLine, headerColumnLengths);
  const headerNames = getHeaderNames(headerLine, headerColumns);
  return getPropertyLines(
    sfdxOutputLines.slice(separatorLineIndex + 1),
    headerColumns,
    headerNames
  );
};

const getHeaderColumnLengths = (separatorLine) => {
  const trimmedSeparatorLine = separatorLine.trim();
  return trimmedSeparatorLine
    .split(/\s+/)
    .map((columnSeparator) => columnSeparator.trim().length);
};

const getHeaderColumns = (separatorLine, headerColumnLengths) => {
  const pattern = headerColumnLengths.reduce((pattern, headerColumnLength) => {
    pattern += "(\\s*)" + "(─*)";
    return pattern;
  }, "");
  const groups = separatorLine
    ? separatorLine.match(new RegExp(pattern)).slice(1)
    : [];
  return groups.reduce((headerColumns, group) => {
    if (
      headerColumns.length === 0 ||
      headerColumns[headerColumns.length - 1].hasOwnProperty("endPosition")
    ) {
      const startPosition =
        headerColumns.length >= 1
          ? headerColumns[headerColumns.length - 1].endPosition +
            group.length +
            1
          : group.length;
      headerColumns.push({ startPosition });
    } else {
      const startPosition =
        headerColumns[headerColumns.length - 1].startPosition;
      headerColumns[headerColumns.length - 1].endPosition =
        startPosition + group.length - 1;
    }
    return headerColumns;
  }, []);
};

const getHeaderNames = (headerLine, headerColumns) => {
  return headerColumns.map((headerColumn) =>
    headerLine
      .slice(headerColumn.startPosition, headerColumn.endPosition + 1)
      .trim()
  );
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

const getPropertyLines = (lines, headerColumns, headerNames) => {
  return lines.map((line) => {
    let headerIndex = 0;
    return headerColumns.reduce((propertyLine, headerColumn) => {
      propertyLine[headerNames[headerIndex]] = line
        .slice(headerColumn.startPosition, headerColumn.endPosition + 1)
        .trim();
      headerIndex++;
      return propertyLine;
    }, {});
  });
};

exports.getSfdxPropertyLines = getSfdxPropertyLines;
