import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './email-style.css';

const EmailControl = ({ config = {} }) => {

  const { register, formState } = useGatewayForm();

  const name = config.name;
  if (!name) {
    console.warn('EmailFieldInput: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    label,
    placeholder = 'Enter email address',
    required = false,
    help = '',
    default: defaultValue = ''
  } = config;

  return (
    <div className="email-field">
      <input
        type="email"
        id={name}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`email-field__input ${fieldError ? 'email-field__input--error' : ''}`}
      />
    </div>
  );
};

const EmailFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<EmailControl config={config} />} />
    );
};

export const EmailFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="email-field__display email-field__display--empty">-</span>;
  }
  return (
    <a href={`mailto:${value}`} className="email-field__display email-field__display--link">
      {String(value)}
    </a>
  );
};

export const emailFieldType = {
  type: 'email',
  Input: EmailFieldTypeInput,
  Display: EmailFieldTypeDisplay,
  defaultConfig: {
    placeholder: 'Enter email address',
  },
};

export const useEmailField = (config) => {
  return useMemo(() => ({
    Input: (props) => <EmailFieldTypeInput {...props} config={config} />,
    Display: (props) => <EmailFieldTypeDisplay {...props} config={config} />
  }), [config]);
};