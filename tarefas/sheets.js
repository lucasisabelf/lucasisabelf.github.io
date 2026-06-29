function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function buildSheetUrl(id, sheetName) {
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&range=A3:D&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCsv(text) {
  const rows = [];
  const re = /("(?:[^"]|"")*"|[^,\r\n]*)(,|\r?\n|\r|$)/g;
  let row = [];
  let match;
  while ((match = re.exec(text)) !== null) {
    let field = match[1];
    const delim = match[2];
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1).replace(/""/g, '"');
    }
    row.push(field);
    if (delim !== ',') {
      rows.push(row);
      row = [];
    }
    if (match[0] === '') break;
  }
  return rows;
}

function filterRows(rows) {
  return rows.filter(r => r[0] && r[0].trim() !== '');
}
