import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

const SelectFieldTypeInput = ({ config = {} }) => {
  const { register, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('SelectFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  let options = config.options || [];

  if (!Array.isArray(options) && typeof options === 'object') {
    options = Object.entries(options).map(([value, label]) => ({
      value,
      label
    }));
  }

  const {
    label,
    placeholder = 'Select an option',
    required = false,
    help = '',
    default: defaultValue = ''
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const selectClasses = ['select-field__select'];
  if (fieldError) {
    selectClasses.push('select-field__select--error');
  }

  return (
    <div className="select-field">
      <label htmlFor={name} className="select-field__label">
        {labelText}
        {required && <span className="select-field__required">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        defaultValue={defaultValue}
        className={selectClasses.join(' ')}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const label = typeof option === 'object' ? option.label : option;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {help && (
        <p className="select-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="select-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

const SelectFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="select-field__display select-field__display--empty">-</span>;
  }

  let options = config?.options || [];

  if (!Array.isArray(options) && typeof options === 'object') {
    options = Object.entries(options).map(([val, label]) => ({
      value: val,
      label
    }));
  }

  const selectedOption = options.find(option => {
    const optionValue = typeof option === 'object' ? option.value : option;
    return optionValue === value;
  });

  const displayValue = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : String(value);

  return <span className="select-field__display">{displayValue}</span>;
};

export const selectFieldType = {
  type: 'select',
  Input: SelectFieldTypeInput,
  Display: SelectFieldTypeDisplay,
  defaultConfig: {
    options: [],
    placeholder: 'Select an option'
  },
};

export const useSelectField = (config) => {
  return useMemo(() => ({
    Input: (props) => <SelectFieldTypeInput {...props} config={config} />,
    Display: (props) => <SelectFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
