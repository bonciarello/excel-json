import { useState, useEffect, useCallback } from 'react';
import { useExcelParser } from './hooks/useExcelParser';
import { sanitizeFieldName } from './utils/convertTypes';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import JsonPreview from './components/JsonPreview';
import DownloadButton from './components/DownloadButton';

function buildDefaultMappings(headers) {
  return headers.map((h, i) => ({
    colIndex: i,
    originalName: h,
    jsonName: sanitizeFieldName(h) || `campo_${i + 1}`,
    type: 'stringa',
  }));
}

export default function App() {
  const { headers, sampleRows, allRows, fileName, error, loading, parseFile, reset } = useExcelParser();
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    if (headers.length > 0) {
      setMappings(buildDefaultMappings(headers));
    }
  }, [headers]);

  const handleFile = useCallback(
    (file) => {
      reset();
      parseFile(file);
    },
    [parseFile, reset]
  );

  const hasData = headers.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span className="brand__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </span>
            <h1 className="brand__title">Excel &rarr; JSON Converter</h1>
          </div>
          {hasData && (
            <button className="reset-btn" onClick={reset} type="button" aria-label="Carica un altro file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Nuovo file
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading" role="status">
            <div className="loading__spinner" />
            <span>Analizzando il file&hellip;</span>
          </div>
        )}

        {!hasData && !loading && (
          <FileUpload onFile={handleFile} disabled={loading} />
        )}

        {hasData && (
          <>
            <div className="file-info">
              <span className="file-info__name">{fileName}</span>
              <span className="file-info__stats">
                {headers.length} colonne &middot; {allRows.length} righe
              </span>
            </div>

            <ColumnMapper
              headers={headers}
              sampleRows={sampleRows}
              mappings={mappings}
              onMappingsChange={setMappings}
            />

            <JsonPreview allRows={allRows} mappings={mappings} />

            <DownloadButton allRows={allRows} mappings={mappings} fileName={fileName} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Elaborazione interamente nel browser &mdash; nessun dato viene inviato a server esterni.</p>
      </footer>
    </div>
  );
}
