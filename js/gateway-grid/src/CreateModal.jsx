import { h } from 'preact';
import { useState, useReducer, useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';
import FormField from './FormField';
import { getFormFields, defaultFor, formReducer } from './formUtils';

const CreateModal = ({ collection, apiRoot, onClose, onCreated }) => {
  const fields     = getFormFields(collection);
  const initValues = Object.fromEntries(fields.map(([k, f]) => [k, defaultFor(f)]));

  const [values,    dispatch]    = useReducer(formReducer, initValues);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const createRoute = Array.isArray(collection.routes)
    ? collection.routes.find(r => r.type === 'create')
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!createRoute) { setError('No create route found for this collection.'); return; }

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

      const res  = await fetch(`${apiRoot}${createRoute.route}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.gatewayBd?.nonce || '' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Server error ${res.status}`);
      onCreated(data?.data ?? data);
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
          <span class="gty-modal__title">New {title}</span>
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
            <button type="submit" class="gty-btn gty-btn--primary" disabled={submitting || !createRoute}>
              {submitting ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModal;
