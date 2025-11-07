import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

const RangeFieldTypeInput = ({ config = {} }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('RangeFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

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
    help = ''
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const initialValue = defaultValue ?? min;

  const [currentValue, setCurrentValue] = useState(initialValue);
  const watchedValue = watch(name);

  useEffect(() => {
    register(name);
  }, [name, register]);

  // Initialize value on mount
  useEffect(() => {
    if (watchedValue === undefined && defaultValue !== undefined) {
      setValue(name, defaultValue);
      setCurrentValue(defaultValue);
    }
  }, []);

  useEffect(() => {
    if (watchedValue !== undefined && watchedValue !== currentValue) {
      setCurrentValue(watchedValue);
    }
  }, [watchedValue]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    setValue(name, newValue, { shouldValidate: true });
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
            {prepend && (
              <span className="range-field__prepend">{prepend}</span>
            )}
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
          </div>
        </div>
      </div>

      {help && (
        <p className="range-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="range-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

const RangeFieldTypeDisplay = ({ value, config }) => {
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

export const rangeFieldType = {
  type: 'range',
  Input: RangeFieldTypeInput,
  Display: RangeFieldTypeDisplay,
  defaultConfig: {
    min: 0,
    max: 100,
    step: 1,
    showMinMax: true,
  },
};

export const useRangeField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RangeFieldTypeInput {...props} config={config} />,
    Display: (props) => <RangeFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
