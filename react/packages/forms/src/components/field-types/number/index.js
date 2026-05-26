import { useMemo } from 'react';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './number-style.css';

const NumberControl = ({ config = {} }) => {

  const { register, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('NumberFieldTypeInput: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    label,
    placeholder = '',
    required = false,
    help = '',
    min,
    max,
    step = 'any',
    default: defaultValue
  } = config;

  const inputClasses = ['number-field__input'];
  if (fieldError) {
    inputClasses.push('number-field__input--error');
  }

  return (
    <div className="number-field">
      <input
        type="number"
        id={name}
        {...register(name)}
        defaultValue={defaultValue !== undefined ? defaultValue : ''}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={inputClasses.join(' ')}
      />
    </div>
  );
};

const NumberFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<NumberControl config={config} />} />
    );
};

const NumberFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="number-field__display number-field__display--empty">-</span>;
  }

  return <span className="number-field__display">{String(value)}</span>;
};

export const numberFieldType = {
  type: 'number',
  Input: NumberFieldTypeInput,
  Display: NumberFieldTypeDisplay,
  defaultConfig: {
    step: 'any',
  },
};

export const useNumberField = (config) => {
  return useMemo(() => ({
    Input: (props) => <NumberFieldTypeInput {...props} config={config} />,
    Display: (props) => <NumberFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
