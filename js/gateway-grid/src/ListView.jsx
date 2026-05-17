import { h } from 'preact';
import { getDisplayField } from './utils';

const ListView = ({ collection, records, onRecordClick, getRecordHref, canSeeActions }) => {
  const displayField = getDisplayField(collection);

  if (records.length === 0) return <p class="gty-grid__empty">No records found.</p>;

  return (
    <div class="gty-list">
      {records.map((record, i) => {
        const Tag  = getRecordHref ? 'a' : 'div';
        const href = getRecordHref ? getRecordHref(record) : undefined;
        return (
        <Tag
          key={record.id}
          href={href}
          class={`gty-list__item gty-list__item--${i % 2 === 0 ? 'even' : 'odd'}${onRecordClick ? ' gty-list__item--clickable' : ''}${getRecordHref ? ' gty-list__item--link' : ''}`}
          onClick={onRecordClick ? () => onRecordClick(record) : undefined}
        >
          <div class="gty-list__content">
            <div class="gty-list__header">
              <span class="gty-list__id">#{record.id}</span>
              {displayField && record[displayField] != null && (
                <span class="gty-list__title">{String(record[displayField])}</span>
              )}
            </div>
            {record.description && (
              <p class="gty-list__desc">{record.description}</p>
            )}
          </div>
          {canSeeActions && (
            <div class="gty-list__actions">
              <span class="gty-actions-placeholder">ACTIONS</span>
            </div>
          )}
        </Tag>
        );
      })}
    </div>
  );
};

export default ListView;
