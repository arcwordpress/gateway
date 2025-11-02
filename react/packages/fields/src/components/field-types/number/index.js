import './style.css';

const NumberFieldInput = ({ fieldName, fieldConfig, register, error }) => {
  const inputClasses = ['number-field__input'];
  if (error) {
    inputClasses.push('number-field__input--error');
  }

  return (
    <div className="number-field">
      <label htmlFor={fieldName} className="number-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="number-field__required">*</span>}
      </label>
      <input
        type="number"
        id={fieldName}
        {...register(fieldName, { valueAsNumber: true })}
        defaultValue={fieldConfig.default !== undefined ? fieldConfig.default : ''}
        placeholder={fieldConfig.placeholder || ''}
        min={fieldConfig.min}
        max={fieldConfig.max}
        step={fieldConfig.step || 'any'}
        className={inputClasses.join(' ')}
      />
      {(fieldConfig.help || fieldConfig.helpText) && (
        <p className="number-field__help">{fieldConfig.help || fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="number-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const NumberFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="number-field__display number-field__display--empty">-</span>;
  }

  return <span className="number-field__display">{String(value)}</span>;
};

export const numberFieldDefinition = {
  type: 'number',
  Input: NumberFieldInput,
  Display: NumberFieldDisplay,
  defaultConfig: {
    step: 'any',
  },
};

export const useNumberField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'number',
  };
};

export default NumberFieldInput;
