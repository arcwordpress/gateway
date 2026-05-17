import { h } from 'preact';
import { getLabelField } from './utils';

const CardsView = ({ collection, records }) => {
  const labelField = getLabelField(collection);

  if (records.length === 0) return <p class="gty-grid__empty">No records found.</p>;

  return (
    <div class="gty-cards">
      {records.map((record) => (
        <div key={record.id} class="gty-cards__card">
          <div class="gty-cards__header">
            <span class="gty-cards__id">#{record.id}</span>
            {labelField && record[labelField] != null && (
              <span class="gty-cards__title">{String(record[labelField])}</span>
            )}
          </div>
          {record.description && (
            <p class="gty-cards__desc">{record.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardsView;
