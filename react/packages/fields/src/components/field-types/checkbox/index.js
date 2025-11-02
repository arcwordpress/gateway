import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const CheckboxFieldInput = ({ fieldName, fieldConfig, register, error }) => {
  return (
    <div className="checkbox-field">
      <div className="checkbox-field__container">
        <input
          type="checkbox"
          id={fieldName}
          {...register(fieldName)}
          defaultChecked={fieldConfig.default || false}
          className={`checkbox-field__input ${error ? 'checkbox-field__input--error' : ''}`}
        />
        <label
          htmlFor={fieldName}
          className="checkbox-field__label"
        >
          {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          {fieldConfig.required && <span className="checkbox-field__required">*</span>}
        </label>
      </div>
      {fieldConfig.help && (
        <p className="checkbox-field__help">{fieldConfig.help}</p>
      )}
      {error && (
        <p className="checkbox-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const CheckboxFieldDisplay = ({ value, config }) => {
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

// Field Definition for registry
export const checkboxFieldDefinition = {
  type: 'checkbox',
  Input: CheckboxFieldInput,
  Display: CheckboxFieldDisplay,
  defaultConfig: {
    default: false,
  },
};

// Hook for easy usage
export const useCheckboxField = (config) => {
  return useMemo(() => ({
    Input: (props) => <CheckboxFieldInput {...props} config={config} />,
    Display: (props) => <CheckboxFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const CheckboxField = CheckboxFieldInput;
export default CheckboxField;
