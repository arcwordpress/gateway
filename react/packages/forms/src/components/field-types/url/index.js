import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './url-style.css';

const URLControl = ({ config = {} }) => {
  const { register, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('URL Field: No "name" provided in config');
    return null;
  }

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
      <input
        type="url"
        id={name}
        className={inputClasses.join(' ')}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
};

const URLFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<URLControl config={config} />} />
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
