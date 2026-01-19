import { useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './style.css';

// Button Group Control Component (for button rendering)
const ButtonGroupControl = ({ config = {} }) => {
  const { register, watch, setValue } = useGatewayForm();
  const { name, options = [] } = config;

  const currentValue = watch(name);

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  const handleClick = (value) => {
    setValue(name, value, { shouldValidate: true });
  };

  return (
    <>
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
    </>
  );
};

// Input Component (for forms)
const ButtonGroupFieldTypeInput = ({ config = {} }) => {
  const { watch, setValue } = useGatewayForm();
  const name = config.name;

  if (!name) {
    console.warn('ButtonGroupFieldTypeInput: No "name" provided in config');
    return null;
  }

  const { default: defaultValue } = config;
  const currentValue = watch(name);

  // Set default value only once on mount if undefined
  useEffect(() => {
    if (defaultValue !== undefined && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  return (
    <Field config={config} fieldControl={<ButtonGroupControl config={config} />} />
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
