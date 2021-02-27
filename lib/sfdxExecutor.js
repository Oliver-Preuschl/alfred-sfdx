async function getSfdxPropertyLines(command, columnCount, separatorLineIndex) {
  const { stdout, stderr } = await exec(command);

  let sfdxOutputLines = stdout.split("\n");

  const separatorLine = sfdxOutputLines[separatorLineIndex];
  const pattern = "\\s*" + "(─*)\\s*".repeat(columnCount - 1) + "(─*)";
  const separatorLineGroups = separatorLine.match(new RegExp(pattern));

  sfdxOutputLines = sfdxOutputLines.slice(separatorLineIndex + 1);
  return sfdxOutputLines.map((line) => {
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
}