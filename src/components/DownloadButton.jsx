import { generateJson } from '../utils/convertTypes';

export default function DownloadButton({ allRows, mappings, fileName }) {
  const handleDownload = () => {
    if (allRows.length === 0 || mappings.length === 0) return;

    const jsonData = generateJson(allRows, mappings);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const baseName = fileName.replace(/\.(xlsx?|xls)$/i, '');
    const downloadName = `${baseName || 'dati'}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (allRows.length === 0) return null;

  return (
    <div className="download-area">
      <button className="download-btn" onClick={handleDownload} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Scarica JSON
      </button>
    </div>
  );
}
