import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './style.css';

// Input Component (for forms)
const TextFieldTypeInput = ({ config = {}, children, ...props }) => {

  const { register, formState, refs } = useGatewayForm(); // Get RHF methods from context

  console.log('Field Refs:', refs.fields);

  if (!config.name) {
    console.warn('TextFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[config.name];

  const {
    name,
    label,
    placeholder = '',
    required = false,
    help = '',
    instructions = '',
    default: defaultValue = ''
  } = config;

  const inputClasses = ['text-field__input'];
  if (fieldError) {
    inputClasses.push('text-field__input--error');
  }

  // The actual input/control for the text field
  const TextInputControl = () => (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      required={required}
      className={inputClasses.join(' ')}
      {...register(name)}
      {...props}
    />
  );

  return (
    <Field config={config} fieldControl={<TextInputControl />} />
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