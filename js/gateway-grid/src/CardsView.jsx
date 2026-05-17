import { h } from 'preact';
import { getLabelField } from './utils';

const CardsView = ({ collection, records }) => {
  const labelField = getLabelField(collection);

  if (records.length === 0) return <p class="gbd-grid__empty">No records found.</p>;

  return (
    <div class="gbd-cards">
      {records.map((record) => (
        <div key={record.id} class="gbd-cards__card">
          <div class="gbd-cards__header">
            <span class="gbd-cards__id">#{record.id}</span>
            {labelField && record[labelField] != null && (
              <span class="gbd-cards__title">{String(record[labelField])}</span>
            )}
          </div>
          {record.description && (
            <p class="gbd-cards__desc">{record.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardsView;
