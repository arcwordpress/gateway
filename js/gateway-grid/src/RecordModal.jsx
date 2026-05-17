import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';
import { getDisplayField, getFieldLabel, formatValue } from './utils';

const getCellDisplay = (record, key, fields) => {
  const field = Array.isArray(fields)
    ? fields.find(f => f.name === key)
    : fields?.[key];

  if (field?.type === 'relation' || field?.type === 'relationship') {
    const relKey = key.endsWith('_id') ? key.slice(0, -3) : key;
    const relObj = record[relKey];
    if (relObj && typeof relObj === 'object') {
      const df = field?.relation?.displayField || field?.displayField || 'title';
      return relObj[df] || relObj.name || relObj.title || relObj.label || String(record[key] ?? '');
    }
  }

  const val = record[key];
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  const formatted = formatValue(val, field);
  if (formatted !== null) return formatted;
  return String(val);
};

const RecordModal = ({ record, collection, onClose }) => {
  const fields       = collection?.fields || {};
  const displayField = getDisplayField(collection);
  const title        = displayField && record[displayField] != null
    ? String(record[displayField])
    : `Record #${record.id}`;

  // Build ordered field list: collection-defined fields first, then any extra keys
  const fieldEntries = Array.isArray(fields)
    ? fields.map(f => ({ key: f.name, label: f.label || f.name }))
    : Object.entries(fields).map(([k, f]) => ({ key: k, label: f?.label || k }));

  const definedKeys = new Set(fieldEntries.map(f => f.key));
  const extraKeys   = Object.keys(record)
    .filter(k => !definedKeys.has(k) && k !== 'id')
    .map(k => ({ key: k, label: k }));

  const allFields = [
    { key: 'id', label: 'ID' },
    ...fieldEntries,
    ...extraKeys,
  ];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div class="gty-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div class="gty-modal__box">
        <div class="gty-modal__header">
          <div class="gty-modal__title">
            <span class="gty-modal__id">#{record.id}</span>
            <span>{title}</span>
          </div>
          <button class="gty-modal__close" onClick={onClose} type="button" title="Close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div class="gty-modal__body">
          <table class="gty-modal__table">
            <tbody>
              {allFields.map(({ key, label }) => (
                <tr key={key} class="gty-modal__row">
                  <td class="gty-modal__cell gty-modal__cell--label">{label}</td>
                  <td class="gty-modal__cell gty-modal__cell--value">
                    {getCellDisplay(record, key, fields)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
