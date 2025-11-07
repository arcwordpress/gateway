import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

// Input Component (for forms)
const ButtonGroupFieldTypeInput = ({ config = {}, error }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  if (!name) {
    console.warn('ButtonGroupFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Use error from props if provided, otherwise from formState
  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    options = [],
    help,
    helpText,
    default: defaultValue
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentValue = watch(name);

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  // Set default value only once on mount if undefined
  useEffect(() => {
    if (defaultValue && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleClick = (value) => {
    setValue(name, value, { shouldValidate: true });
  };

  return (
    <div className="button-group-field">
      <label className="button-group-field__label">
        {labelText}
        {required && <span className="button-group-field__required">*</span>}
      </label>

      {/* Hidden input for form registration */}
      <input type="hidden" {...register(name)} />

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

      {(help || helpText) && (
        <p className="button-group-field__help">{help || helpText}</p>
      )}
      {fieldError && (
        <p className="button-group-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const ButtonGroupFieldTypeDisplay = ({ value, config }) => {
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

// Field Type Definition for registry
export const buttonGroupFieldType = {
  type: 'button-group',
  Input: ButtonGroupFieldTypeInput,
  Display: ButtonGroupFieldTypeDisplay,
  defaultConfig: {
    options: [],
  },
};

// Hook for easy usage
export const useButtonGroupField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ButtonGroupFieldTypeInput {...props} config={config} />,
    Display: (props) => <ButtonGroupFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
