import { h } from 'preact';

const getLabelField = (collection) => {
  if (collection?.displayField && collection.displayField !== 'id') {
    return collection.displayField;
  }
  if (collection?.grid?.labelField) return collection.grid.labelField;

  const fields = collection?.fields;
  const candidates = ['title', 'name', 'label'];

  if (Array.isArray(fields)) {
    const names = fields.map((f) => f.name);
    for (const c of candidates) {
      if (names.includes(c)) return c;
    }
  } else if (fields && typeof fields === 'object') {
    for (const c of candidates) {
      if (fields[c]) return c;
    }
  }
  return null;
};

const getCellValue = (record, key, fields) => {
  const field = fields?.[key];
  // For relation fields, prefer the embedded related object
  if (field?.type === 'relation' || field?.type === 'relationship') {
    const relKey = key.endsWith('_id') ? key.slice(0, -3) : key;
    const relObj = record[relKey];
    if (relObj && typeof relObj === 'object') {
      const labelField = field?.relation?.labelField || field?.labelField || 'title';
      return relObj[labelField] || relObj.name || relObj.title || relObj.label || String(record[key] ?? '');
    }
  }
  const val = record[key];
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const Grid = ({ collection, records }) => {
  const fields = collection?.fields || {};
  const labelField = getLabelField(collection);

  // Determine columns: explicit grid.columns, else first 5 non-id fields
  let columns;
  if (collection?.grid?.columns?.length) {
    columns = collection.grid.columns.map((c) => ({
      key: c.field,
      label: c.label || c.field,
    }));
  } else {
    const SKIP = new Set(['id', labelField].filter(Boolean));
    const fieldEntries = Array.isArray(fields)
      ? fields.map((f) => [f.name, f])
      : Object.entries(fields);
    columns = fieldEntries
      .filter(([k]) => !SKIP.has(k))
      .slice(0, 3)
      .map(([k, f]) => ({ key: k, label: f.label || k }));
  }

  if (records.length === 0) {
    return <p class="gbd-grid__empty">No records found.</p>;
  }

  return (
    <div class="gbd-grid__table-wrap">
      <table class="gbd-grid__table">
        <thead>
          <tr>
            <th class="gbd-grid__th gbd-grid__th--id">ID</th>
            {labelField && <th class="gbd-grid__th">{fields?.[labelField]?.label || labelField}</th>}
            {columns.map((col) => (
              <th key={col.key} class="gbd-grid__th">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} class="gbd-grid__row">
              <td class="gbd-grid__td gbd-grid__td--id">#{record.id}</td>
              {labelField && (
                <td class="gbd-grid__td">{getCellValue(record, labelField, fields)}</td>
              )}
              {columns.map((col) => (
                <td key={col.key} class="gbd-grid__td">
                  {getCellValue(record, col.key, fields)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;
