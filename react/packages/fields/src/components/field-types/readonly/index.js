import './style.css';

const ReadOnlyFieldInput = ({ config = {}, register, value, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('ReadOnlyFieldInput: No "name" provided in props or config');
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

export const ReadOnlyFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="readonly-field__display readonly-field__display--empty">-</span>;
  }

  return <span className="readonly-field__display">{String(value)}</span>;
};

export const readonlyFieldDefinition = {
  type: 'readonly',
  Input: ReadOnlyFieldInput,
  Display: ReadOnlyFieldDisplay,
  defaultConfig: {},
};

export const useReadOnlyField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'readonly',
  };
};

export default ReadOnlyFieldInput;
