import { h } from 'preact';
import { getLabelField } from './utils';

const ListView = ({ collection, records }) => {
  const labelField = getLabelField(collection);

  if (records.length === 0) return <p class="gbd-grid__empty">No records found.</p>;

  return (
    <div class="gbd-list">
      {records.map((record) => (
        <div key={record.id} class="gbd-list__item">
          <div class="gbd-list__content">
            <div class="gbd-list__header">
              <span class="gbd-list__id">#{record.id}</span>
              {labelField && record[labelField] != null && (
                <span class="gbd-list__title">{String(record[labelField])}</span>
              )}
            </div>
            {record.description && (
              <p class="gbd-list__desc">{record.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
