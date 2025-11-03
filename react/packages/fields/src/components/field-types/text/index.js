import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms) — Unified interface accepts register, setValue, watch
const TextFieldInput = ({ config = {}, error, register, setValue, watch, inputType = 'text' }) => {
  const name = config.name;
  if (!name) {
    console.warn('TextFieldInput: No "name" provided in config — skipping render.');
    return null;
  }

  const {
    label,
    placeholder = '',
    required = false,
    help = ''
  } = config;

  const inputClasses = ['text-field__input'];
  if (error) {
    inputClasses.push('text-field__input--error');
  }

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="text-field">
      <label
        htmlFor={name}
        className="text-field__label"
      >
        {labelText}
        {required && <span className="text-field__required">*</span>}
      </label>
      <input
        type={inputType}
        id={name}
        {...register(name)}
        placeholder={placeholder}
        className={inputClasses.join(' ')}
      />
      {help && (
        <p className="text-field__help">{help}</p>
      )}
      {error && (
        <p className="text-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (unchanged, but add config default for safety)
export const TextFieldDisplay = ({ value, config = {} }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="text-field__display text-field__display--empty">-</span>;
  }

  return <span className="text-field__display">{String(value)}</span>;
};

// Field Definition for registry (unchanged, but add name to defaultConfig for array usage)
export const textFieldDefinition = {
  type: 'text',
  Input: TextFieldInput,
  Display: TextFieldDisplay,
  defaultConfig: {
    name: '',  // Optional: For array defs
    placeholder: '',
    inputType: 'text',
  },
};

// Hook for easy usage (unchanged—now aligns perfectly with refactored Input)
export const useTextField = (config) => {
  return useMemo(() => ({
    Input: (props) => <TextFieldInput {...props} config={config} />,
    Display: (props) => <TextFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility (wraps Input)
const TextField = (props) => <TextFieldInput {...props} />;
export default TextField;