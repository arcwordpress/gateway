import { h } from 'preact';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-preact';
import { getDisplayField, formatValue } from './utils';

const getCellValue = (record, key, fields) => {
  const field = fields?.[key];
  if (field?.type === 'relation' || field?.type === 'relationship') {
    const relKey = key.endsWith('_id') ? key.slice(0, -3) : key;
    const relObj = record[relKey];
    if (relObj && typeof relObj === 'object') {
      const displayField = field?.relation?.displayField || field?.displayField || 'title';
      return relObj[displayField] || relObj.name || relObj.title || relObj.label || String(record[key] ?? '');
    }
  }
  const val = record[key];
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  const formatted = formatValue(val, field);
  if (formatted !== null) return formatted;
  return String(val);
};

const SortIcon = ({ field, sortField, sortDir }) => {
  if (field !== sortField) return <ArrowUpDown size={11} strokeWidth={2} />;
  return sortDir === 'asc'
    ? <ArrowDownNarrowWide size={11} strokeWidth={2} />
    : <ArrowUpNarrowWide size={11} strokeWidth={2} />;
};

const Grid = ({ collection, records, sortField, sortDir, onSort, hiddenFields = [] }) => {
  const fields = collection?.fields || {};
  let displayField = getDisplayField(collection);
  const gridConfig = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};

  let columns;
  if (gridConfig?.columns?.length) {
    columns = gridConfig.columns.map((c) => ({
      key: c.field,
      label: c.label || c.field,
    }));
  } else {
    const SKIP = new Set(['id', displayField].filter(Boolean));
    const fieldEntries = Array.isArray(fields)
      ? fields.map((f) => [f.name, f])
      : Object.entries(fields);
    columns = fieldEntries
      .filter(([k]) => !SKIP.has(k))
      .slice(0, 5)
      .map(([k, f]) => ({ key: k, label: f.label || k }));
  }

  const hidden = new Set(hiddenFields);
  if (hidden.has(displayField)) displayField = null;
  columns = columns.filter(col => !hidden.has(col.key));

  if (records.length === 0) {
    return <p class="gty-grid__empty">No records found.</p>;
  }

  const thClass = (key) => {
    let cls = 'gty-grid__th gty-grid__th--sortable';
    if (key === sortField) cls += ' gty-grid__th--sorted';
    return cls;
  };

  return (
    <div class="gty-grid__table-wrap">
      <table class="gty-grid__table">
        <thead>
          <tr>
            <th class={thClass('id')} style="width:3rem" onClick={() => onSort('id')}>
              <span class="gty-grid__th-inner">
                ID
                <span class="gty-grid__sort-icon">
                  <SortIcon field="id" sortField={sortField} sortDir={sortDir} />
                </span>
              </span>
            </th>
            {displayField && (
              <th class={thClass(displayField)} onClick={() => onSort(displayField)}>
                <span class="gty-grid__th-inner">
                  {fields?.[displayField]?.label || displayField}
                  <span class="gty-grid__sort-icon">
                    <SortIcon field={displayField} sortField={sortField} sortDir={sortDir} />
                  </span>
                </span>
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} class={thClass(col.key)} onClick={() => onSort(col.key)}>
                <span class="gty-grid__th-inner">
                  {col.label}
                  <span class="gty-grid__sort-icon">
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} class="gty-grid__row">
              <td class="gty-grid__td gty-grid__td--id">#{record.id}</td>
              {displayField && (
                <td class="gty-grid__td">{getCellValue(record, displayField, fields)}</td>
              )}
              {columns.map((col) => (
                <td key={col.key} class="gty-grid__td">
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
