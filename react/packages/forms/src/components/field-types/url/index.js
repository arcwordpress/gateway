import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

const URLFieldTypeInput = ({ config = {} }) => {
  const { register, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('URLFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label = '',
    placeholder = 'https://example.com',
    help = '',
    default: defaultValue = ''
  } = config;

  const inputClasses = ['url-field__input'];
  if (fieldError) {
    inputClasses.push('url-field__input--error');
  }

  return (
    <div className="url-field">
      {label && (
        <label htmlFor={name} className="url-field__label">
          {label}
        </label>
      )}

      <input
        type="url"
        id={name}
        className={inputClasses.join(' ')}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />

      {help && <p className="url-field__help">{help}</p>}
      {fieldError && <p className="url-field__error">{fieldError.message}</p>}
    </div>
  );
};

const URLFieldTypeDisplay = ({ value, config }) => {
  if (!value) {
    return <span className="url-field__display url-field__display--empty">-</span>;
  }

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!isValidUrl(value)) {
    return <span className="url-field__display url-field__display--invalid">{value}</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="url-field__display url-field__display--link"
    >
      {value}
    </a>
  );
};

export const urlFieldType = {
  type: 'url',
  Input: URLFieldTypeInput,
  Display: URLFieldTypeDisplay,
  defaultConfig: {
    label: '',
    placeholder: 'https://example.com',
    help: '',
    default: ''
  }
};

export const useUrlField = (config) => {
  return useMemo(() => ({
    Input: (props) => <URLFieldTypeInput {...props} config={config} />,
    Display: (props) => <URLFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
