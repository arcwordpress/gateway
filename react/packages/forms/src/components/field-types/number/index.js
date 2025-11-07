import { useMemo } from '@wordpress/element';
import './style.css';

const NumberFieldTypeInput = ({ config = {}, error, register, setValue, watch }) => {
  const name = config.name;
  if (!name) {
    console.warn('NumberFieldTypeInput: No "name" provided in config');
    return null;
  }

  const {
    label,
    placeholder = '',
    required = false,
    help,
    helpText,
    min,
    max,
    step = 'any',
    default: defaultValue
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const inputClasses = ['number-field__input'];
  if (error) {
    inputClasses.push('number-field__input--error');
  }

  return (
    <div className="number-field">
      <label htmlFor={name} className="number-field__label">
        {labelText}
        {required && <span className="number-field__required">*</span>}
      </label>
      <input
        type="number"
        id={name}
        {...register(name)}
        defaultValue={defaultValue !== undefined ? defaultValue : ''}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={inputClasses.join(' ')}
      />
      {(help || helpText) && (
        <p className="number-field__help">{help || helpText}</p>
      )}
      {error && (
        <p className="number-field__error">{error.message}</p>
      )}
    </div>
  );
};

const NumberFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="number-field__display number-field__display--empty">-</span>;
  }

  return <span className="number-field__display">{String(value)}</span>;
};

export const numberFieldType = {
  type: 'number',
  Input: NumberFieldTypeInput,
  Display: NumberFieldTypeDisplay,
  defaultConfig: {
    step: 'any',
  },
};

export const useNumberField = (config) => {
  return useMemo(() => ({
    Input: (props) => <NumberFieldTypeInput {...props} config={config} />,
    Display: (props) => <NumberFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
