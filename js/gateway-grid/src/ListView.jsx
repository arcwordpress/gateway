import { h } from 'preact';
import { getLabelField } from './utils';

const ListView = ({ collection, records }) => {
  const labelField = getLabelField(collection);

  if (records.length === 0) return <p class="gty-grid__empty">No records found.</p>;

  return (
    <div class="gty-list">
      {records.map((record) => (
        <div key={record.id} class="gty-list__item">
          <div class="gty-list__content">
            <div class="gty-list__header">
              <span class="gty-list__id">#{record.id}</span>
              {labelField && record[labelField] != null && (
                <span class="gty-list__title">{String(record[labelField])}</span>
              )}
            </div>
            {record.description && (
              <p class="gty-list__desc">{record.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
