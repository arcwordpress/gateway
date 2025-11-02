import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const EmailFieldInput = ({ fieldName, fieldConfig, register, error }) => {
  return (
    <div className="email-field">
      <label
        htmlFor={fieldName}
        className="email-field__label"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="email-field__required">*</span>}
      </label>
      <input
        type="email"
        id={fieldName}
        {...register(fieldName)}
        defaultValue={fieldConfig.default || ''}
        placeholder={fieldConfig.placeholder || 'Enter email address'}
        className={`email-field__input ${error ? 'email-field__input--error' : ''}`}
      />
      {fieldConfig.help && (
        <p className="email-field__help">{fieldConfig.help}</p>
      )}
      {error && (
        <p className="email-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const EmailFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="email-field__display email-field__display--empty">-</span>;
  }

  return (
    <a href={`mailto:${value}`} className="email-field__display email-field__display--link">
      {String(value)}
    </a>
  );
};

// Field Definition for registry
export const emailFieldDefinition = {
  type: 'email',
  Input: EmailFieldInput,
  Display: EmailFieldDisplay,
  defaultConfig: {
    placeholder: 'Enter email address',
  },
};

// Hook for easy usage
export const useEmailField = (config) => {
  return useMemo(() => ({
    Input: (props) => <EmailFieldInput {...props} config={config} />,
    Display: (props) => <EmailFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const EmailField = EmailFieldInput;
export default EmailField;
