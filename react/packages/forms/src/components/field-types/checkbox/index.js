import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './checkbox-style.css';

const CheckboxControl = ({ config = {}, error }) => {

  const { register, formState } = useGatewayForm();
  const name = config.name;
  if (!name) {
    console.warn('CheckboxFieldTypeInput: No "name" provided in config');
    return null;
  }

  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultRaw = false
  } = config;

  // Coerce string "true"/"false" from Exta Builder to boolean
  const defaultChecked = typeof defaultRaw === 'string'
    ? defaultRaw === 'true' || defaultRaw === '1'
    : Boolean(defaultRaw);

  return (
    <div className="checkbox-field">
      <div className="checkbox-field__container">
        <input
          type="checkbox"
          id={name}
          {...register(name)}
          defaultChecked={defaultChecked}
          className={`checkbox-field__input ${fieldError ? 'checkbox-field__input--error' : ''}`}
        />
        <label
          htmlFor={name}
          className="checkbox-field__label"
        >
          {label}
          {required && <span className="checkbox-field__required">*</span>}
        </label>
      </div>
    </div>
  );
};

const CheckboxFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<CheckboxControl config={config} />} />
    );
};

const CheckboxFieldTypeDisplay = ({ value, config }) => {

  if (value === null || value === undefined) {
    return <span className="checkbox-field__display checkbox-field__display--unchecked">☐</span>;
  }

  const isChecked = Boolean(value);
  return (
    <span className={`checkbox-field__display ${isChecked ? 'checkbox-field__display--checked' : 'checkbox-field__display--unchecked'}`}>
      {isChecked ? '☑' : '☐'}
    </span>
  );
  
};

export const checkboxFieldType = {
  type: 'checkbox',
  Input: CheckboxFieldTypeInput,
  Display: CheckboxFieldTypeDisplay,
  defaultConfig: {
    default: false,
  },
};

export const useCheckboxField = (config) => {
  return useMemo(() => ({
    Input: (props) => <CheckboxFieldTypeInput {...props} config={config} />,
    Display: (props) => <CheckboxFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
