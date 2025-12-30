import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import Field from '../../field';
import './style.css';

// Input Component (for forms)
const TextFieldTypeInput = ({ config = {}, children, ...props }) => {

  const { register, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  if (!name) {
    console.warn('TextFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
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

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // If children were passed to the Input component, render them directly (consumer composition).
  // Otherwise render the default composed Field with label, control, help and error.
  if (children) {
    return (
      <Field className="text-field" {...props}>
        {children}
      </Field>
    );
  }

  const helpId = help ? `${name}-help` : undefined;
  const instructionsId = instructions ? `${name}-instructions` : undefined;
  const ariaDescribedBy = [helpId, instructionsId].filter(Boolean).join(' ') || undefined;

  return (
    <Field className={`text-field ${fieldError ? 'text-field--error' : ''}`.trim()} {...props}>
      <Field.Label htmlFor={name}>
        {labelText}
        {required && <span className="text-field__required">*</span>}
        {help && (
          <Field.Help aria-describedby={helpId} className="text-field__help-icon" />
        )}
      </Field.Label>

      <Field.Control
        id={name}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClasses.join(' ')}
        aria-describedby={ariaDescribedBy}
      />

      {help && (
        <Field.Instructions id={helpId} className="text-field__help">{help}</Field.Instructions>
      )}

      {instructions && (
        <Field.Instructions id={instructionsId} className="text-field__instructions">{instructions}</Field.Instructions>
      )}

      {fieldError && (
        <p className="text-field__error" role="alert">{fieldError.message}</p>
      )}
    </Field>
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