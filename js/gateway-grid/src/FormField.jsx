import { h } from 'preact';

const FormField = ({ fieldKey, field, value, onChange }) => {
  const label = field.label || fieldKey;
  const id    = `gty-ff-${fieldKey}`;
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

export default FormField;
