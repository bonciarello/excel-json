import { describe, it, expect } from 'vitest';
import { convertRow, generateJson, sanitizeFieldName, JSON_TYPES } from '../src/utils/convertTypes';

describe('sanitizeFieldName', () => {
  it('converts spaces to underscores', () => {
    expect(sanitizeFieldName('Nome Cliente')).toBe('nome_cliente');
  });

  it('removes special characters', () => {
    expect(sanitizeFieldName('Prezzo €!')).toBe('prezzo');
  });

  it('removes leading/trailing underscores', () => {
    expect(sanitizeFieldName('  _test_  ')).toBe('test');
  });

  it('handles empty input', () => {
    expect(sanitizeFieldName('')).toBe('');
  });

  it('handles numbers at start', () => {
    expect(sanitizeFieldName('123abc')).toBe('_123abc');
  });

  it('collapses multiple underscores', () => {
    expect(sanitizeFieldName('a   b___c')).toBe('a_b_c');
  });

  it('handles accented characters', () => {
    const result = sanitizeFieldName('Città');
    expect(result).not.toContain('à');
  });
});

describe('JSON_TYPES', () => {
  it('has exactly 4 types', () => {
    expect(JSON_TYPES).toHaveLength(4);
  });

  it('includes stringa, numero, booleano, data', () => {
    const values = JSON_TYPES.map((t) => t.value);
    expect(values).toContain('stringa');
    expect(values).toContain('numero');
    expect(values).toContain('booleano');
    expect(values).toContain('data');
  });
});

describe('convertRow', () => {
  const mappings = [
    { colIndex: 0, jsonName: 'nome', type: 'stringa' },
    { colIndex: 1, jsonName: 'eta', type: 'numero' },
    { colIndex: 2, jsonName: 'attivo', type: 'booleano' },
    { colIndex: 3, jsonName: 'data_nascita', type: 'data' },
  ];

  it('converts a row correctly with all types', () => {
    const row = ['Mario', '30', 'true', '1990-05-15'];
    const result = convertRow(row, mappings);
    expect(result.nome).toBe('Mario');
    expect(result.eta).toBe(30);
    expect(result.attivo).toBe(true);
    expect(result.data_nascita).toBe('1990-05-15');
  });

  it('handles boolean variations', () => {
    const boolMappings = [{ colIndex: 0, jsonName: 'flag', type: 'booleano' }];
    expect(convertRow(['true'], boolMappings).flag).toBe(true);
    expect(convertRow(['false'], boolMappings).flag).toBe(false);
    expect(convertRow(['1'], boolMappings).flag).toBe(true);
    expect(convertRow(['0'], boolMappings).flag).toBe(false);
    expect(convertRow(['sì'], boolMappings).flag).toBe(true);
    expect(convertRow(['no'], boolMappings).flag).toBe(false);
    expect(convertRow(['maybe'], boolMappings).flag).toBe(null);
  });

  it('handles invalid numbers as null', () => {
    const numMappings = [{ colIndex: 0, jsonName: 'val', type: 'numero' }];
    expect(convertRow(['abc'], numMappings).val).toBe(null);
    expect(convertRow([''], numMappings).val).toBe(null);
  });

  it('handles invalid dates as null', () => {
    const dateMappings = [{ colIndex: 0, jsonName: 'd', type: 'data' }];
    expect(convertRow(['not a date'], dateMappings).d).toBe(null);
  });

  it('handles empty string conversion', () => {
    const strMappings = [{ colIndex: 0, jsonName: 'text', type: 'stringa' }];
    expect(convertRow([''], strMappings).text).toBe('');
  });

  it('handles null/undefined cell values', () => {
    const row = [null, undefined];
    const mappings2 = [
      { colIndex: 0, jsonName: 'a', type: 'stringa' },
      { colIndex: 1, jsonName: 'b', type: 'stringa' },
    ];
    const result = convertRow(row, mappings2);
    expect(result.a).toBe('');
    expect(result.b).toBe('');
  });
});

describe('generateJson', () => {
  it('generates JSON array from rows', () => {
    const allRows = [
      ['Alice', '25'],
      ['Bob', '30'],
    ];
    const mappings = [
      { colIndex: 0, jsonName: 'nome', type: 'stringa' },
      { colIndex: 1, jsonName: 'eta', type: 'numero' },
    ];
    const result = generateJson(allRows, mappings);
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('Alice');
    expect(result[0].eta).toBe(25);
    expect(result[1].nome).toBe('Bob');
    expect(result[1].eta).toBe(30);
  });

  it('returns empty array for empty rows', () => {
    expect(generateJson([], [])).toEqual([]);
  });

  it('handles rows with fewer columns than mappings', () => {
    const rows = [['Alice']];
    const mappings = [
      { colIndex: 0, jsonName: 'nome', type: 'stringa' },
      { colIndex: 1, jsonName: 'eta', type: 'numero' },
    ];
    const result = generateJson(rows, mappings);
    expect(result[0].nome).toBe('Alice');
    expect(result[0].eta).toBe(null);
  });

  it('produces valid JSON when stringified', () => {
    const rows = [['Test', '123']];
    const mappings = [
      { colIndex: 0, jsonName: 'campo', type: 'stringa' },
      { colIndex: 1, jsonName: 'valore', type: 'numero' },
    ];
    const result = generateJson(rows, mappings);
    const jsonStr = JSON.stringify(result);
    expect(() => JSON.parse(jsonStr)).not.toThrow();
    const parsed = JSON.parse(jsonStr);
    expect(parsed[0].campo).toBe('Test');
    expect(parsed[0].valore).toBe(123);
  });
});
