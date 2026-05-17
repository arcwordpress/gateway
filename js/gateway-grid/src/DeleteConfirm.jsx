import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';
import { buildUpdateUrl } from './formUtils';
import { getDisplayField } from './utils';

const DeleteConfirm = ({ collection, record, apiRoot, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  const deleteUrl = buildUpdateUrl(collection, apiRoot, record.id);

  const displayField = getDisplayField(collection);
  const label = displayField && record[displayField] != null
    ? String(record[displayField])
    : null;

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleDelete = async () => {
    if (!deleteUrl) { setError('No delete route found for this collection.'); return; }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(deleteUrl, {
        method:  'DELETE',
        headers: { 'X-WP-Nonce': window.gatewayBd?.nonce || '' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Server error ${res.status}`);
      }
      onDeleted(record.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const title = collection.title || collection.name || 'Record';

  return (
    <div class="gty-modal__overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div class="gty-modal__box gty-modal__box--sm">
        <div class="gty-modal__header">
          <span class="gty-modal__title">Delete {title}</span>
          <button class="gty-modal__close" type="button" onClick={onClose}><X size={18} strokeWidth={2} /></button>
        </div>
        <div class="gty-modal__body gty-delete__body">
          <p class="gty-delete__msg">
            Are you sure you want to delete
            {label ? <> <strong>{label}</strong></> : null}
            {' '}<span class="gty-modal__title-id">#{record.id}</span>?
            This cannot be undone.
          </p>
          {error && <p class="gty-form__error">{error}</p>}
        </div>
        <div class="gty-modal__footer">
          <button type="button" class="gty-btn gty-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" class="gty-btn gty-btn--danger" disabled={deleting || !deleteUrl} onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
