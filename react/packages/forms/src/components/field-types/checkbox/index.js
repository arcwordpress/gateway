import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

// Input Component (for forms)
const CheckboxFieldTypeInput = ({ config = {}, error }) => {
  const { register, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  if (!name) {
    console.warn('CheckboxFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Use error from props if provided, otherwise from formState
  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultChecked = false
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="checkbox-field">
      <div className="checkbox-field__container">
        <input
          type="checkbox"
          id={name}
          {...register(name)}
          defaultChecked={defaultChecked}
          className={`checkbox-field__input ${fieldError ? 'checkbox-field__input--error' : ''}`}
        />
        <label
          htmlFor={name}
          className="checkbox-field__label"
        >
          {labelText}
          {required && <span className="checkbox-field__required">*</span>}
        </label>
      </div>
      {help && (
        <p className="checkbox-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="checkbox-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const CheckboxFieldTypeDisplay = ({ value, config }) => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return <span className="checkbox-field__display checkbox-field__display--unchecked">☐</span>;
  }

  // Convert to boolean
  const isChecked = Boolean(value);

  return (
    <span className={`checkbox-field__display ${isChecked ? 'checkbox-field__display--checked' : 'checkbox-field__display--unchecked'}`}>
      {isChecked ? '☑' : '☐'}
    </span>
  );
};

// Field Type Definition for registry
export const checkboxFieldType = {
  type: 'checkbox',
  Input: CheckboxFieldTypeInput,
  Display: CheckboxFieldTypeDisplay,
  defaultConfig: {
    default: false,
  },
};

// Hook for easy usage
export const useCheckboxField = (config) => {
  return useMemo(() => ({
    Input: (props) => <CheckboxFieldTypeInput {...props} config={config} />,
    Display: (props) => <CheckboxFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
