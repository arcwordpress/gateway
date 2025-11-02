import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const TextFieldInput = ({ fieldName, fieldConfig, inputType = 'text', register, error }) => {
  const inputClasses = ['text-field__input'];
  if (error) {
    inputClasses.push('text-field__input--error');
  }

  return (
    <div className="text-field">
      <label
        htmlFor={fieldName}
        className="text-field__label"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-field__required">*</span>}
      </label>
      <input
        type={inputType}
        id={fieldName}
        {...register(fieldName)}
        defaultValue={fieldConfig.default || ''}
        placeholder={fieldConfig.placeholder || ''}
        className={inputClasses.join(' ')}
      />
      {fieldConfig.help && (
        <p className="text-field__help">{fieldConfig.help}</p>
      )}
      {error && (
        <p className="text-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const TextFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="text-field__display text-field__display--empty">-</span>;
  }

  return <span className="text-field__display">{String(value)}</span>;
};

// Field Definition for registry
export const textFieldDefinition = {
  type: 'text',
  Input: TextFieldInput,
  Display: TextFieldDisplay,
  defaultConfig: {
    placeholder: '',
    inputType: 'text',
  },
};

// Hook for easy usage
export const useTextField = (config) => {
  return useMemo(() => ({
    Input: (props) => <TextFieldInput {...props} config={config} />,
    Display: (props) => <TextFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const TextField = TextFieldInput;
export default TextField;
