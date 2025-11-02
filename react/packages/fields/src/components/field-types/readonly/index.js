import './style.css';

const ReadOnlyFieldInput = ({ fieldName, fieldConfig, register, value }) => {
  const fieldValue = value || fieldConfig.value || fieldConfig.default || '';

  return (
    <div className="readonly-field">
      <label htmlFor={fieldName} className="readonly-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </label>
      <input
        type="text"
        id={fieldName}
        {...register(fieldName)}
        defaultValue={fieldValue}
        readOnly
        className="readonly-field__input"
      />
      {fieldConfig.help && (
        <p className="readonly-field__help">{fieldConfig.help}</p>
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
