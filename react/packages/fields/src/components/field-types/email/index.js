import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const EmailFieldInput = ({ config = {}, error, register, setValue, watch }) => {
  const name = config.name;
  if (!name) {
    console.warn('EmailFieldInput: No "name" provided in config');
    return null;
  }

  const {
    label,
    placeholder = 'Enter email address',
    required = false,
    help,
    default: defaultValue = ''
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="email-field">
      <label
        htmlFor={name}
        className="email-field__label"
      >
        {labelText}
        {required && <span className="email-field__required">*</span>}
      </label>
      <input
        type="email"
        id={name}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`email-field__input ${error ? 'email-field__input--error' : ''}`}
      />
      {help && (
        <p className="email-field__help">{help}</p>
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
