import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './style.css';

const SelectControl = ({ config = {} }) => {

  const { register, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('SelectFieldTypeInput: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  let options = config.options || [];

  // Support comma-separated string (from Exta Builder)
  if (typeof options === 'string') {
    options = options.split(',').map(opt => opt.trim()).filter(Boolean);
  } else if (!Array.isArray(options) && typeof options === 'object') {
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

  const selectClasses = ['select-field__select'];
  if (fieldError) {
    selectClasses.push('select-field__select--error');
  }

  return (
    <div className="select-field">
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
    </div>
  );
};

const SelectFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<SelectControl config={config} />} />
    );
};

const SelectFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="select-field__display select-field__display--empty">-</span>;
  }

  let options = config?.options || [];

  // Support comma-separated string (from Exta Builder)
  if (typeof options === 'string') {
    options = options.split(',').map(opt => opt.trim()).filter(Boolean);
  } else if (!Array.isArray(options) && typeof options === 'object') {
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
    placeholder: 'Select an option' // @TODO is placeholder applicable to a select field type?
  },
};

export const useSelectField = (config) => {
  return useMemo(() => ({
    Input: (props) => <SelectFieldTypeInput {...props} config={config} />,
    Display: (props) => <SelectFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
