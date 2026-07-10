const TYPE_HANDLERS = {
  stringa: (v) => String(v ?? ''),
  numero: (v) => {
    const s = String(v ?? '').trim();
    if (s === '') return null;
    const n = Number(s);
    return isNaN(n) ? null : n;
  },
  booleano: (v) => {
    if (typeof v === 'boolean') return v;
    const s = String(v ?? '').trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'sì' || s === 'si' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
    return null;
  },
  data: (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  },
};

export const JSON_TYPES = [
  { value: 'stringa', label: 'Stringa' },
  { value: 'numero', label: 'Numero' },
  { value: 'booleano', label: 'Booleano' },
  { value: 'data', label: 'Data (YYYY-MM-DD)' },
];

export function convertRow(row, mappings) {
  const obj = {};
  for (const mapping of mappings) {
    const rawValue = row[mapping.colIndex] ?? '';
    const handler = TYPE_HANDLERS[mapping.type] || TYPE_HANDLERS.stringa;
    obj[mapping.jsonName] = handler(rawValue);
  }
  return obj;
}

export function generateJson(allRows, mappings) {
  return allRows.map((row) => convertRow(row, mappings));
}

export function sanitizeFieldName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/^(\d)/, '_$1');
}
