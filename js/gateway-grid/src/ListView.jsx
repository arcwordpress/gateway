import { h } from 'preact';

const getLabelField = (collection) => {
  if (collection?.displayField && collection.displayField !== 'id') return collection.displayField;
  const grid = collection?.grid && !Array.isArray(collection.grid) ? collection.grid : {};
  if (grid?.labelField) return grid.labelField;
  const fields = collection?.fields;
  for (const c of ['title', 'name', 'label']) {
    if (Array.isArray(fields) ? fields.some(f => f.name === c) : fields?.[c]) return c;
  }
  return null;
};

const ListView = ({ collection, records }) => {
  const labelField = getLabelField(collection);

  if (records.length === 0) return <p class="gbd-grid__empty">No records found.</p>;

  return (
    <ul class="gbd-list">
      {records.map((record) => (
        <li key={record.id} class="gbd-list__item">
          <span class="gbd-list__id">#{record.id}</span>
          {labelField && record[labelField] != null && (
            <span class="gbd-list__label">{String(record[labelField])}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ListView;
