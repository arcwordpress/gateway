export const resolveRecordLink = (pattern, record) => {
  if (!pattern || !record) return null;
  return pattern.replace(/\{\{record\.([^}]+)\}\}/g, (_, path) => {
    const val = path.split('.').reduce((obj, key) => obj?.[key], record);
    return val != null ? String(val) : '';
  });
};

export const formatValue = (val, field) => {
  const fmt = field?.format ?? field?.config?.format;
  if (!fmt || val === null || val === undefined || val === '') return null;

  const num = Number(val);
  if (Number.isNaN(num)) return null;

  const [type, tag] = typeof fmt === 'string' ? fmt.split(':') : [fmt.type, fmt.currency];

  try {
    if (type === 'currency') {
      return new Intl.NumberFormat(undefined, {
        style:    'currency',
        currency: tag || 'USD',
        maximumFractionDigits: Number.isInteger(num) ? 0 : 2,
      }).format(num);
    }
    if (type === 'number') {
      return new Intl.NumberFormat(undefined).format(num);
    }
    if (type === 'percent') {
      return new Intl.NumberFormat(undefined, {
        style:             'percent',
        maximumFractionDigits: 2,
      }).format(num / 100);
    }
  } catch {}

  return null;
};

export const getFieldLabel = (fields, key) => {
  if (!fields || !key) return key;
  const f = Array.isArray(fields)
    ? fields.find(f => f.name === key)
    : fields[key];
  return f?.label || key;
};

export const getDisplayField = (collection) => {
  if (collection?.displayField && collection.displayField !== 'id') return collection.displayField;
  const grid = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};
  if (grid?.displayField) return grid.displayField;
  const fields = collection?.fields;
  for (const c of ['title', 'name', 'label']) {
    if (Array.isArray(fields) ? fields.some(f => f.name === c) : fields?.[c]) return c;
  }
  return null;
};

export const getSortableFields = (collection) => {
  if (!collection) return [];
  const fields     = collection.fields || {};
  const displayField = getDisplayField(collection);
  const gridConfig = collection.grid && !Array.isArray(collection.grid) ? collection.grid : {};

  let cols;
  if (gridConfig?.columns?.length) {
    cols = gridConfig.columns.map(c => ({ key: c.field, label: c.label || c.field }));
  } else {
    const SKIP = new Set(['id', displayField].filter(Boolean));
    const entries = Array.isArray(fields)
      ? fields.map(f => [f.name, f])
      : Object.entries(fields);
    cols = entries
      .filter(([k]) => !SKIP.has(k))
      .slice(0, 3)
      .map(([k, f]) => ({ key: k, label: f.label || k }));
  }

  const result = [{ key: 'id', label: 'ID' }];
  if (displayField) {
    result.push({ key: displayField, label: getFieldLabel(fields, displayField) });
  }
  for (const col of cols) {
    if (!result.some(r => r.key === col.key)) result.push(col);
  }
  return result;
};
