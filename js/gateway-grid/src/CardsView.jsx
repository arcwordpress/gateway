import { h } from 'preact';
import { getDisplayField } from './utils';

const CardsView = ({ collection, records }) => {
  const displayField = getDisplayField(collection);

  if (records.length === 0) return <p class="gty-grid__empty">No records found.</p>;

  return (
    <div class="gty-cards">
      {records.map((record) => (
        <div key={record.id} class="gty-cards__card">
          <div class="gty-cards__header">
            <span class="gty-cards__id">#{record.id}</span>
            {displayField && record[displayField] != null && (
              <span class="gty-cards__title">{String(record[displayField])}</span>
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
