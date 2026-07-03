export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const re = /("(?:[^"]|"")*"|[^,\r\n]*)(,|\r?\n|\r|$)/g;
  let row: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match[0] === '') break;
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
  }
  return rows;
}

export function filterRows(rows: string[][]): string[][] {
  return rows.filter((r) => r[0] && r[0].trim() !== '');
}

export function csvEscape(str: string | undefined | null): string {
  const s = str || '';
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
