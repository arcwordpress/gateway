import { h } from 'preact';
import { useState, useReducer, useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';

const SKIP_NAMES = new Set(['id', 'created_at', 'updated_at', 'deleted_at']);
const SKIP_TYPES = new Set(['relation', 'relationship', 'file', 'image', 'gallery']);

function getCreateFields(collection) {
  const raw = collection.fields || {};
  const fillable = Array.isArray(collection.fillable) ? new Set(collection.fillable) : null;

  const entries = Array.isArray(raw)
    ? raw.map(f => [f.name, f])
    : Object.entries(raw);

  return entries.filter(([key, field]) => {
    if (SKIP_NAMES.has(key)) return false;
    if (SKIP_TYPES.has(field.type)) return false;
    if (field.hidden) return false;
    if (fillable && !fillable.has(key)) return false;
    return true;
  });
}

function defaultFor(field) {
  if (field.type === 'boolean' || field.type === 'checkbox') return false;
  return '';
}

function formReducer(state, action) {
  if (action.type === 'SET') return { ...state, [action.field]: action.value };
  if (action.type === 'RESET') return action.payload;
  return state;
}

const FieldInput = ({ fieldKey, field, value, onChange }) => {
  const label = field.label || fieldKey;
  const id    = `gty-cf-${fieldKey}`;
  const type  = field.type;

  if (type === 'boolean' || type === 'checkbox') {
    return (
      <div class="gty-form__field gty-form__field--checkbox">
        <input
          id={id}
          type="checkbox"
          class="gty-form__checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
        />
        <label for={id} class="gty-form__label gty-form__label--inline">{label}</label>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div class="gty-form__field">
        <label class="gty-form__label" for={id}>
          {label}{field.required && <span class="gty-form__req">*</span>}
        </label>
        <textarea
          id={id}
          class="gty-form__input gty-form__textarea"
          value={value}
          rows={4}
          required={!!field.required}
          onInput={e => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (type === 'select' && Array.isArray(field.options)) {
    return (
      <div class="gty-form__field">
        <label class="gty-form__label" for={id}>
          {label}{field.required && <span class="gty-form__req">*</span>}
        </label>
        <select
          id={id}
          class="gty-form__input gty-form__select"
          value={value}
          required={!!field.required}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— Select —</option>
          {field.options.map(opt => {
            const v = typeof opt === 'object' ? String(opt.value ?? opt.key ?? opt.id ?? '') : String(opt);
            const l = typeof opt === 'object' ? String(opt.label ?? opt.name ?? v) : String(opt);
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
      </div>
    );
  }

  const inputType = type === 'email'    ? 'email'
    : type === 'url'      ? 'url'
    : type === 'password' ? 'password'
    : type === 'number'   ? 'number'
    : type === 'date'     ? 'date'
    : (type === 'datetime' || type === 'datetime-picker') ? 'datetime-local'
    : 'text';

  return (
    <div class="gty-form__field">
      <label class="gty-form__label" for={id}>
        {label}{field.required && <span class="gty-form__req">*</span>}
      </label>
      <input
        id={id}
        type={inputType}
        class="gty-form__input"
        value={value}
        required={!!field.required}
        step={inputType === 'number' ? 'any' : undefined}
        onInput={e => onChange(e.target.value)}
      />
    </div>
  );
};

const CreateModal = ({ collection, apiRoot, onClose, onCreated }) => {
  const fields       = getCreateFields(collection);
  const initValues   = Object.fromEntries(fields.map(([k, f]) => [k, defaultFor(f)]));
  const [values, dispatch] = useReducer(formReducer, initValues);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const createRoute = Array.isArray(collection.routes)
    ? collection.routes.find(r => r.type === 'create')
    : null;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!createRoute) { setError('No create route found for this collection.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {};
      for (const [key, field] of fields) {
        const val = values[key];
        if (field.type === 'number') {
          payload[key] = val === '' ? null : Number(val);
        } else if (field.type === 'boolean' || field.type === 'checkbox') {
          payload[key] = !!val;
        } else {
          payload[key] = val;
        }
      }

      const res = await fetch(`${apiRoot}${createRoute.route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.gatewayBd?.nonce || '',
        },
        body: JSON.stringify(payload),
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
    <div
      class="gty-modal__overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div class="gty-modal__box">
        <div class="gty-modal__header">
          <span class="gty-modal__title">New {title}</span>
          <button class="gty-modal__close" type="button" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="gty-modal__body gty-form__body">
            {fields.length === 0 && (
              <p class="gty-form__empty">No fillable fields defined for this collection.</p>
            )}
            {fields.map(([key, field]) => (
              <FieldInput
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
            <button type="button" class="gty-btn gty-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              class="gty-btn gty-btn--primary"
              disabled={submitting || !createRoute}
            >
              {submitting ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModal;
