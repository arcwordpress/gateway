import { h } from 'preact';
import { useState, useReducer, useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';
import FormField from './FormField';
import { getFormFields, formReducer, buildUpdateUrl } from './formUtils';

const UpdateModal = ({ collection, record, apiRoot, onClose, onUpdated }) => {
  const fields = getFormFields(collection);

  // Pre-populate from existing record; coerce booleans so checkboxes render correctly
  const initValues = Object.fromEntries(
    fields.map(([k, f]) => {
      const val = record[k];
      if (f.type === 'boolean' || f.type === 'checkbox') return [k, !!val];
      return [k, val != null ? String(val) : ''];
    })
  );

  const [values,     dispatch]     = useReducer(formReducer, initValues);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const updateUrl = buildUpdateUrl(collection, apiRoot, record.id);

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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!updateUrl) {
      setError(`No update route found. Routes available: ${JSON.stringify((collection.routes||[]).map(r=>r.type))}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {};
      for (const [key, field] of fields) {
        const val = values[key];
        payload[key] = field.type === 'number'
          ? (val === '' ? null : Number(val))
          : (field.type === 'boolean' || field.type === 'checkbox')
            ? !!val : val;
      }

      console.log('[Gateway] UPDATE', updateUrl, payload);
      const res  = await fetch(updateUrl, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.gatewayBd?.nonce || '' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`${data?.message || `Server error ${res.status}`} (URL: ${updateUrl})`);
      onUpdated(data?.data ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = collection.title || collection.name || 'Record';

  return (
    <div class="gty-modal__overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div class="gty-modal__box">
        <div class="gty-modal__header">
          <span class="gty-modal__title">Edit {title} <span class="gty-modal__title-id">#{record.id}</span></span>
          <button class="gty-modal__close" type="button" onClick={onClose}><X size={18} strokeWidth={2} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="gty-modal__body gty-form__body">
            {fields.length === 0 && <p class="gty-form__empty">No fillable fields defined for this collection.</p>}
            {fields.map(([key, field]) => (
              <FormField
                key={key}
                fieldKey={key}
                field={field}
                value={values[key]}
                onChange={val => dispatch({ type: 'SET', field: key, value: val })}
              />
            ))}
            {error && <p class="gty-form__error">{error}</p>}
          </div>
          <div class="gty-modal__footer">
            <button type="button" class="gty-btn gty-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" class="gty-btn gty-btn--primary" disabled={submitting || !updateUrl}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateModal;
