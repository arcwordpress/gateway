import { useState, useEffect, useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const ButtonGroupFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const options = fieldConfig.options || [];
  const currentValue = watch ? watch(fieldName) : '';

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  // Set default value only once on mount if undefined
  useEffect(() => {
    if (fieldConfig.default && setValue && currentValue === undefined) {
      setValue(fieldName, fieldConfig.default);
    }
  }, []);

  const handleClick = (value) => {
    if (setValue) {
      setValue(fieldName, value, { shouldValidate: true });
    }
  };

  return (
    <div className="button-group-field">
      <label className="button-group-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="button-group-field__required">*</span>}
      </label>

      {/* Hidden input for form registration */}
      <input type="hidden" {...register(fieldName)} />

      <div className="button-group-field__buttons" role="group">
        {normalizedOptions.map((option, index) => {
          const isFirst = index === 0;
          const isLast = index === normalizedOptions.length - 1;
          const isSelected = currentValue === option.value;

          const classes = [
            'button-group-field__button',
            isFirst && 'button-group-field__button--first',
            isLast && 'button-group-field__button--last',
            isSelected && 'button-group-field__button--selected',
            !isFirst && 'button-group-field__button--not-first'
          ].filter(Boolean).join(' ');

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(option.value)}
              className={classes}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {(fieldConfig.help || fieldConfig.helpText) && (
        <p className="button-group-field__help">{fieldConfig.help || fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="button-group-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const ButtonGroupFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="button-group-field__display button-group-field__display--empty">-</span>;
  }

  // Get options from config
  const options = config?.options || [];

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  // Find the selected option's label
  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : String(value);

  return <span className="button-group-field__display">{displayValue}</span>;
};

// Field Definition for registry
export const buttonGroupFieldDefinition = {
  type: 'button-group',
  Input: ButtonGroupFieldInput,
  Display: ButtonGroupFieldDisplay,
  defaultConfig: {
    options: [],
  },
};

// Hook for easy usage
export const useButtonGroupField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ButtonGroupFieldInput {...props} config={config} />,
    Display: (props) => <ButtonGroupFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const ButtonGroupField = ButtonGroupFieldInput;
export default ButtonGroupField;
