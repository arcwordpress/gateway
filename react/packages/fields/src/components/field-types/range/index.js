import { useState, useEffect } from '@wordpress/element';
import './style.css';

const RangeFieldInput = ({ config = {}, error, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('RangeFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required = false,
    min = 0,
    max = 100,
    step = 1,
    default: defaultValue,
    showMinMax = true,
    append,
    prepend,
    helpText
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const initialValue = defaultValue ?? min;

  const [currentValue, setCurrentValue] = useState(initialValue);

  const watchedValue = watch ? watch(name) : undefined;

  useEffect(() => {
    if (watchedValue !== undefined && watchedValue !== currentValue) {
      setCurrentValue(watchedValue);
    }
  }, [watchedValue]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    if (setValue) {
      setValue(name, newValue);
    }
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className="range-field">
      <label htmlFor={name} className="range-field__label">
        {labelText}
        {required && <span className="range-field__required">*</span>}
      </label>

      <div className="range-field__wrapper">
        <div className="range-field__slider-container">
          <div className="range-field__slider-wrapper">
            <input
              type="range"
              id={name}
              {...inputProps}
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onChange={handleChange}
              className="range-field__slider"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {(showMinMax || showMinMax === undefined) && (
            <div className="range-field__minmax">
              <span className="range-field__min">{min}</span>
              <span className="range-field__max">{max}</span>
            </div>
          )}
        </div>

        <div className="range-field__value-container">
          <div className="range-field__value-wrapper">
            <input
              type="number"
              value={currentValue}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              className="range-field__number-input"
            />
            {append && (
              <span className="range-field__append">{append}</span>
            )}
            {prepend && (
              <span className="range-field__prepend">{prepend}</span>
            )}
          </div>
        </div>
      </div>

      {helpText && (
        <p className="range-field__help">{helpText}</p>
      )}
      {error && (
        <p className="range-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const RangeFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="range-field__display range-field__display--empty">-</span>;
  }

  const append = config?.append || '';
  const prepend = config?.prepend || '';

  return (
    <span className="range-field__display">
      {prepend}{String(value)}{append}
    </span>
  );
};

export const rangeFieldDefinition = {
  type: 'range',
  Input: RangeFieldInput,
  Display: RangeFieldDisplay,
  defaultConfig: {
    min: 0,
    max: 100,
    step: 1,
    showMinMax: true,
  },
};

export const useRangeField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'range',
  };
};

export default RangeFieldInput;
