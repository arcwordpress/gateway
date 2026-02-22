import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './style.css';

const TextInputControl = ({ config = {} }) => {

  const { register, formState, watch } = useGatewayForm();

  const name = config.name;
  if (!name) {
    console.warn('TextInputControl: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    placeholder = '',
    required = false,
    default: defaultValue = ''
  } = config;

  const watchResult = watch(name);
  const currentValue = watchResult ?? defaultValue;
  console.log('[TextInputControl] name:', name, '| watch(name):', watchResult, '| currentValue:', currentValue);

  const inputClasses = ['text-field__input'];
  if (fieldError) {
    inputClasses.push('text-field__input--error');
  }

  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={currentValue}
      required={required}
      className={inputClasses.join(' ')}
      {...register(name)}
    />
  );
};

// Input Component (for forms)
const TextFieldTypeInput = ({ config = {} }) => {
  return (
    <Field config={config} fieldControl={<TextInputControl config={config} />} />
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
    label: '',
    placeholder: '',
    help: '',
    instructions: '',
    required: false,
    default: ''
  }
};

// Hook for easy usage
export const useTextField = (config) => {
  return useMemo(() => ({
    Input: (props) => <TextFieldTypeInput {...props} config={config} />,
    Display: (props) => <TextFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
