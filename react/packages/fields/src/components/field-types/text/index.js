import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const TextFieldTypeInput = ({ config = {}, error, register, setValue, watch, inputType = 'text' }) => {
  const name = config.name;
  if (!name) {
    console.warn('TextFieldTypeInput: No "name" provided in config');
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

// Display Component
const TextFieldTypeDisplay = ({ value, config = {} }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-field__display text-field__display--empty">-</span>;
  }

  return <span className="text-field__display">{String(value)}</span>;
};

// Field Type Definition for registry
export const textFieldType = {
  type: 'text',
  Input: TextFieldTypeInput,
  Display: TextFieldTypeDisplay,
  defaultConfig: {
    name: '',
    placeholder: '',
    inputType: 'text',
  },
};

// Hook for easy usage
export const useTextField = (config) => {
  return useMemo(() => ({
    Input: (props) => <TextFieldTypeInput {...props} config={config} />,
    Display: (props) => <TextFieldTypeDisplay {...props} config={config} />
  }), [config]);
};