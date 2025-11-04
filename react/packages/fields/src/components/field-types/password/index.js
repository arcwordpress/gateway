import { useState, useMemo } from '@wordpress/element';
import './style.css';

const PasswordFieldTypeInput = ({ config = {}, error, register, setValue, watch }) => {
  const name = config.name;
  if (!name) {
    console.warn('PasswordFieldTypeInput: No "name" provided in config');
    return null;
  }

  const {
    label,
    placeholder = '',
    required = false,
    helpText,
    autoComplete = 'current-password'
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputClasses = ['password-field__input'];
  if (error) {
    inputClasses.push('password-field__input--error');
  }

  return (
    <div className="password-field">
      <label htmlFor={name} className="password-field__label">
        {labelText}
        {required && <span className="password-field__required">*</span>}
      </label>
      <div className="password-field__wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          {...(register ? register(name) : {})}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClasses.join(' ')}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="password-field__toggle"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="password-field__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="password-field__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {helpText && (
        <p className="password-field__help">{helpText}</p>
      )}
      {error && (
        <p className="password-field__error">{error.message}</p>
      )}
    </div>
  );
};

const PasswordFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="password-field__display password-field__display--empty">-</span>;
  }

  return <span className="password-field__display password-field__display--masked">••••••••</span>;
};

export const passwordFieldType = {
  type: 'password',
  Input: PasswordFieldTypeInput,
  Display: PasswordFieldTypeDisplay,
  defaultConfig: {
    autoComplete: 'current-password',
  },
};

export const usePasswordField = (config) => {
  return useMemo(() => ({
    Input: (props) => <PasswordFieldTypeInput {...props} config={config} />,
    Display: (props) => <PasswordFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
