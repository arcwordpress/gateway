import { h } from 'preact';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-preact';
import { getLabelField } from './utils';

const getCellValue = (record, key, fields) => {
  const field = fields?.[key];
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

const SortIcon = ({ field, sortField, sortDir }) => {
  if (field !== sortField) return <ArrowUpDown size={11} strokeWidth={2} />;
  return sortDir === 'asc'
    ? <ArrowDownNarrowWide size={11} strokeWidth={2} />
    : <ArrowUpNarrowWide size={11} strokeWidth={2} />;
};

const Grid = ({ collection, records, sortField, sortDir, onSort }) => {
  const fields = collection?.fields || {};
  const labelField = getLabelField(collection);
  const gridConfig = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};

  let columns;
  if (gridConfig?.columns?.length) {
    columns = gridConfig.columns.map((c) => ({
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

  const thClass = (key) => {
    let cls = 'gbd-grid__th gbd-grid__th--sortable';
    if (key === sortField) cls += ' gbd-grid__th--sorted';
    return cls;
  };

  return (
    <div class="gbd-grid__table-wrap">
      <table class="gbd-grid__table">
        <thead>
          <tr>
            <th class="gbd-grid__th gbd-grid__th--id">ID</th>
            {labelField && (
              <th class={thClass(labelField)} onClick={() => onSort(labelField)}>
                <span class="gbd-grid__th-inner">
                  {fields?.[labelField]?.label || labelField}
                  <span class="gbd-grid__sort-icon">
                    <SortIcon field={labelField} sortField={sortField} sortDir={sortDir} />
                  </span>
                </span>
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} class={thClass(col.key)} onClick={() => onSort(col.key)}>
                <span class="gbd-grid__th-inner">
                  {col.label}
                  <span class="gbd-grid__sort-icon">
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                  </span>
                </span>
              </th>
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
