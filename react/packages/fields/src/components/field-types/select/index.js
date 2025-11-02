import './style.css';

const SelectFieldInput = ({ fieldName, fieldConfig, register, error }) => {
  let options = fieldConfig.options || [];

  if (!Array.isArray(options) && typeof options === 'object') {
    options = Object.entries(options).map(([value, label]) => ({
      value,
      label
    }));
  }

  const placeholder = fieldConfig.placeholder || 'Select an option';

  const selectClasses = ['select-field__select'];
  if (error) {
    selectClasses.push('select-field__select--error');
  }

  return (
    <div className="select-field">
      <label htmlFor={fieldName} className="select-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="select-field__required">*</span>}
      </label>
      <select
        id={fieldName}
        {...register(fieldName)}
        defaultValue={fieldConfig.default || ''}
        className={selectClasses.join(' ')}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const label = typeof option === 'object' ? option.label : option;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {fieldConfig.help && (
        <p className="select-field__help">{fieldConfig.help}</p>
      )}
      {error && (
        <p className="select-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const SelectFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="select-field__display select-field__display--empty">-</span>;
  }

  let options = config?.options || [];

  if (!Array.isArray(options) && typeof options === 'object') {
    options = Object.entries(options).map(([val, label]) => ({
      value: val,
      label
    }));
  }

  const selectedOption = options.find(option => {
    const optionValue = typeof option === 'object' ? option.value : option;
    return optionValue === value;
  });

  const displayValue = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : String(value);

  return <span className="select-field__display">{displayValue}</span>;
};

export const selectFieldDefinition = {
  type: 'select',
  Input: SelectFieldInput,
  Display: SelectFieldDisplay,
  defaultConfig: {
    options: [],
  },
};

export const useSelectField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'select',
  };
};

export default SelectFieldInput;
