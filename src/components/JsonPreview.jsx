import { useMemo } from 'react';
import { generateJson } from '../utils/convertTypes';

export default function JsonPreview({ allRows, mappings }) {
  const jsonOutput = useMemo(() => {
    if (allRows.length === 0 || mappings.length === 0) return null;
    return generateJson(allRows, mappings);
  }, [allRows, mappings]);

  if (!jsonOutput) return null;

  const jsonString = JSON.stringify(jsonOutput, null, 2);
  const itemCount = jsonOutput.length;
  const fieldCount = mappings.length;

  return (
    <section className="json-preview" aria-label="Anteprima JSON">
      <header className="json-preview__header">
        <h2 className="json-preview__title">Anteprima JSON</h2>
        <p className="json-preview__meta">
          {itemCount} {itemCount === 1 ? 'riga' : 'righe'} &middot; {fieldCount} {fieldCount === 1 ? 'campo' : 'campi'}
        </p>
      </header>
      <pre className="json-preview__code"><code>{jsonString}</code></pre>
    </section>
  );
}
