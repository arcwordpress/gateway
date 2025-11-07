import { useMemo } from '@wordpress/element';
import './style.css';

const ReadOnlyFieldTypeInput = ({ config = {}, register, value, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('ReadOnlyFieldTypeInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    help,
    value: configValue,
    default: defaultValue = '',
  } = config;

  const fieldValue = value || configValue || defaultValue;

  return (
    <div className="readonly-field">
      <label htmlFor={name} className="readonly-field__label">
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </label>
      <input
        type="text"
        id={name}
        {...register(name)}
        defaultValue={fieldValue}
        readOnly
        className="readonly-field__input"
      />
      {help && (
        <p className="readonly-field__help">{help}</p>
      )}
    </div>
  );
};

const ReadOnlyFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="readonly-field__display readonly-field__display--empty">-</span>;
  }

  return <span className="readonly-field__display">{String(value)}</span>;
};

export const readonlyFieldType = {
  type: 'readonly',
  Input: ReadOnlyFieldTypeInput,
  Display: ReadOnlyFieldTypeDisplay,
  defaultConfig: {},
};

export const useReadOnlyField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ReadOnlyFieldTypeInput {...props} config={config} />,
    Display: (props) => <ReadOnlyFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
