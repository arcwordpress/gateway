import { useState, useEffect } from '@wordpress/element';
import './style.css';

const RangeFieldInput = ({ fieldName, fieldConfig, register, error, setValue, watch }) => {
  const min = fieldConfig.min ?? 0;
  const max = fieldConfig.max ?? 100;
  const step = fieldConfig.step ?? 1;
  const defaultValue = fieldConfig.default ?? min;

  const [currentValue, setCurrentValue] = useState(defaultValue);

  const watchedValue = watch ? watch(fieldName) : undefined;

  useEffect(() => {
    if (watchedValue !== undefined && watchedValue !== currentValue) {
      setCurrentValue(watchedValue);
    }
  }, [watchedValue]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    if (setValue) {
      setValue(fieldName, newValue);
    }
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className="range-field">
      <label htmlFor={fieldName} className="range-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="range-field__required">*</span>}
      </label>

      <div className="range-field__wrapper">
        <div className="range-field__slider-container">
          <div className="range-field__slider-wrapper">
            <input
              type="range"
              id={fieldName}
              {...register(fieldName, { valueAsNumber: true })}
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

          {(fieldConfig.showMinMax || fieldConfig.showMinMax === undefined) && (
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
            {fieldConfig.append && (
              <span className="range-field__append">{fieldConfig.append}</span>
            )}
            {fieldConfig.prepend && (
              <span className="range-field__prepend">{fieldConfig.prepend}</span>
            )}
          </div>
        </div>
      </div>

      {fieldConfig.helpText && (
        <p className="range-field__help">{fieldConfig.helpText}</p>
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
