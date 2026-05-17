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
