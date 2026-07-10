import { useCallback } from 'react';
import { JSON_TYPES, sanitizeFieldName } from '../utils/convertTypes';

export default function ColumnMapper({ headers, sampleRows, mappings, onMappingsChange }) {
  const handleNameChange = useCallback(
    (colIndex, rawValue) => {
      const newMappings = mappings.map((m) =>
        m.colIndex === colIndex ? { ...m, jsonName: sanitizeFieldName(rawValue) || m.jsonName } : m
      );
      onMappingsChange(newMappings);
    },
    [mappings, onMappingsChange]
  );

  const handleTypeChange = useCallback(
    (colIndex, type) => {
      const newMappings = mappings.map((m) =>
        m.colIndex === colIndex ? { ...m, type } : m
      );
      onMappingsChange(newMappings);
    },
    [mappings, onMappingsChange]
  );

  if (headers.length === 0) return null;

  return (
    <section className="column-mapper" aria-label="Editor mapping colonne">
      <header className="column-mapper__header">
        <h2 className="column-mapper__title">Mapping delle colonne</h2>
        <p className="column-mapper__desc">
          Per ogni colonna del tuo file, definisci il nome del campo JSON e il tipo di dato.
        </p>
      </header>

      <div className="column-mapper__table-wrapper">
        <table className="column-mapper__table">
          <thead>
            <tr>
              <th className="col-header-original">Colonna originale</th>
              <th className="col-header-sample">Dati di esempio</th>
              <th className="col-header-name">Nome campo JSON</th>
              <th className="col-header-type">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, colIndex) => {
              const mapping = mappings[colIndex];
              const sampleValues = sampleRows.map((row) => String(row[colIndex] ?? '')).filter((v) => v !== '');

              return (
                <tr key={colIndex}>
                  <td className="col-original">
                    <span className="col-tag">{header || `Colonna ${colIndex + 1}`}</span>
                  </td>
                  <td className="col-sample">
                    {sampleValues.length > 0 ? (
                      <ul className="sample-list">
                        {sampleValues.slice(0, 3).map((val, i) => (
                          <li key={i} className="sample-item">{val}</li>
                        ))}
                        {sampleValues.length > 3 && (
                          <li className="sample-more">+{sampleValues.length - 3} altri</li>
                        )}
                      </ul>
                    ) : (
                      <span className="sample-empty">—</span>
                    )}
                  </td>
                  <td className="col-name">
                    <label className="sr-only" htmlFor={`field-name-${colIndex}`}>
                      Nome campo JSON per {header || `colonna ${colIndex + 1}`}
                    </label>
                    <input
                      id={`field-name-${colIndex}`}
                      type="text"
                      className="field-name-input"
                      value={mapping.jsonName}
                      onChange={(e) => handleNameChange(colIndex, e.target.value)}
                      placeholder="nome_campo"
                      spellCheck={false}
                    />
                  </td>
                  <td className="col-type">
                    <label className="sr-only" htmlFor={`field-type-${colIndex}`}>
                      Tipo per {header || `colonna ${colIndex + 1}`}
                    </label>
                    <select
                      id={`field-type-${colIndex}`}
                      className="field-type-select"
                      value={mapping.type}
                      onChange={(e) => handleTypeChange(colIndex, e.target.value)}
                    >
                      {JSON_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
