import { useMemo } from '@wordpress/element';
import './style.css';

const RadioFieldTypeInput = ({ config = {}, error, register, setValue, watch }) => {
  const name = config.name;
  if (!name) {
    console.warn('RadioFieldTypeInput: No "name" provided in config');
    return null;
  }

  const {
    label,
    required = false,
    options = [],
    layout = 'vertical',
    help,
    helpText,
    default: defaultValue
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  const containerClasses = ['radio-field__options'];
  if (layout === 'horizontal') {
    containerClasses.push('radio-field__options--horizontal');
  }

  return (
    <div className="radio-field">
      <label className="radio-field__label">
        {labelText}
        {required && <span className="radio-field__required">*</span>}
      </label>

      <div className={containerClasses.join(' ')}>
        {normalizedOptions.map((option, index) => (
          <div key={index} className="radio-field__option">
            <input
              type="radio"
              id={`${name}-${index}`}
              value={option.value}
              {...(register ? register(name) : {})}
              defaultChecked={defaultValue === option.value}
              className="radio-field__input"
            />
            <label
              htmlFor={`${name}-${index}`}
              className="radio-field__option-label"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {(help || helpText) && (
        <p className="radio-field__help">{help || helpText}</p>
      )}
      {error && (
        <p className="radio-field__error">{error.message}</p>
      )}
    </div>
  );
};

const RadioFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="radio-field__display radio-field__display--empty">-</span>;
  }

  const options = config?.options || [];
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : String(value);

  return <span className="radio-field__display">{displayValue}</span>;
};

export const radioFieldType = {
  type: 'radio',
  Input: RadioFieldTypeInput,
  Display: RadioFieldTypeDisplay,
  defaultConfig: {
    options: [],
    layout: 'vertical',
  },
};

export const useRadioField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RadioFieldTypeInput {...props} config={config} />,
    Display: (props) => <RadioFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
