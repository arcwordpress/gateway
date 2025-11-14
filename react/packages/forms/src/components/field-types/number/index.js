import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

const NumberFieldTypeInput = ({ config = {} }) => {
  const { register, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('NumberFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    placeholder = '',
    required = false,
    help = '',
    min,
    max,
    step = 'any',
    default: defaultValue
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const inputClasses = ['number-field__input'];
  if (fieldError) {
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
      {help && (
        <p className="number-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="number-field__error">{fieldError.message}</p>
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
