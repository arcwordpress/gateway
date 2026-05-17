import { h } from 'preact';
import { getDisplayField } from './utils';

const CardsView = ({ collection, records, onRecordClick, getRecordHref }) => {
  const displayField = getDisplayField(collection);

  if (records.length === 0) return <p class="gty-grid__empty">No records found.</p>;

  return (
    <div class="gty-cards">
      {records.map((record) => {
        const Tag  = getRecordHref ? 'a' : 'div';
        const href = getRecordHref ? getRecordHref(record) : undefined;
        return (
        <Tag
          key={record.id}
          href={href}
          class={`gty-cards__card${onRecordClick ? ' gty-cards__card--clickable' : ''}${getRecordHref ? ' gty-cards__card--link' : ''}`}
          onClick={onRecordClick ? () => onRecordClick(record) : undefined}
        >
          <div class="gty-cards__header">
            <span class="gty-cards__id">#{record.id}</span>
            {displayField && record[displayField] != null && (
              <span class="gty-cards__title">{String(record[displayField])}</span>
            )}
          </div>
          {record.description && (
            <p class="gty-cards__desc">{record.description}</p>
          )}
        </Tag>
        );
      })}
    </div>
  );
};

export default CardsView;
