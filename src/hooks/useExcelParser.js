import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

export function useExcelParser() {
  const [headers, setHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback((file) => {
    setError('');
    setLoading(true);

    if (!file) {
      setError('Nessun file selezionato.');
      setLoading(false);
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExt = /\.xlsx$/i;

    if (!validTypes.includes(file.type) && !validExt.test(file.name)) {
      setError('Formato non supportato. Carica un file .xlsx.');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          setError('Il file non contiene fogli di lavoro.');
          setLoading(false);
          return;
        }
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (jsonData.length === 0) {
          setError('Il foglio è vuoto.');
          setLoading(false);
          return;
        }

        const rawHeaders = jsonData[0].map((h) => String(h || ''));
        const dataRows = jsonData.slice(1);

        if (rawHeaders.every((h) => h === '')) {
          setError('Nessuna intestazione trovata nella prima riga.');
          setLoading(false);
          return;
        }

        setHeaders(rawHeaders);
        setSampleRows(dataRows.slice(0, 5));
        setAllRows(dataRows);
        setFileName(file.name);
        setLoading(false);
      } catch (err) {
        setError('Errore durante la lettura del file. Verifica che sia un file Excel valido.');
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Errore durante la lettura del file.');
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    setHeaders([]);
    setSampleRows([]);
    setAllRows([]);
    setFileName('');
    setError('');
    setLoading(false);
  }, []);

  return { headers, sampleRows, allRows, fileName, error, loading, parseFile, reset };
}
