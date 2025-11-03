import { createElement, useMemo } from '@wordpress/element';
import './style.css';

const URLFieldTypeInput = ({ config = {}, error, register, setValue, watch }) => {
  const name = config.name;
  if (!name) {
    console.warn('URLFieldTypeInput: No "name" provided in config');
    return null;
  }

  const {
    label = '',
    placeholder = 'https://example.com',
    help = '',
    default: defaultValue = ''
  } = config;

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
        className="url-field__input"
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />

      {help && <p className="url-field__help">{help}</p>}
      {error && <p className="url-field__error">{error.message}</p>}
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
