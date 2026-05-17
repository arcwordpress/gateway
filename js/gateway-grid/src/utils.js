export const getLabelField = (collection) => {
  if (collection?.displayField && collection.displayField !== 'id') return collection.displayField;
  const grid = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};
  if (grid?.labelField) return grid.labelField;
  const fields = collection?.fields;
  for (const c of ['title', 'name', 'label']) {
    if (Array.isArray(fields) ? fields.some(f => f.name === c) : fields?.[c]) return c;
  }
  return null;
};

export const getSortableFields = (collection) => {
  if (!collection) return [];
  const fields     = collection.fields || {};
  const labelField = getLabelField(collection);
  const gridConfig = collection.grid && !Array.isArray(collection.grid) ? collection.grid : {};

  let cols;
  if (gridConfig?.columns?.length) {
    cols = gridConfig.columns.map(c => ({ key: c.field, label: c.label || c.field }));
  } else {
    const SKIP = new Set(['id', labelField].filter(Boolean));
    const entries = Array.isArray(fields)
      ? fields.map(f => [f.name, f])
      : Object.entries(fields);
    cols = entries
      .filter(([k]) => !SKIP.has(k))
      .slice(0, 3)
      .map(([k, f]) => ({ key: k, label: f.label || k }));
  }

  const result = [];
  if (labelField) {
    const lf = Array.isArray(fields)
      ? fields.find(f => f.name === labelField)
      : fields[labelField];
    result.push({ key: labelField, label: lf?.label || labelField });
  }
  for (const col of cols) {
    if (!result.some(r => r.key === col.key)) result.push(col);
  }
  return result;
};
