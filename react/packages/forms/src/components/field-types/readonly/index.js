import { useMemo } from 'react';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './readonly-style.css';

const ReadOnlyControl = ({ config = {} }) => {

  const { register, watch } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('Read Only Field: No "name" provided in config');
    return null;
  }

  const {
    label,
    help = '',
    value: configValue,
    default: defaultValue = '',
  } = config;

  const currentValue = watch(name);
  const fieldValue = currentValue || configValue || defaultValue;

  return (
    <div className="readonly-field">
      <input
        type="text"
        id={name}
        {...register(name)}
        value={fieldValue}
        readOnly
        className="readonly-field__input"
      />
    </div>
  );
};

const ReadOnlyFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<ReadOnlyControl config={config} />} />
    );
};

const ReadOnlyFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="readonly-field__display readonly-field__display--empty">-</span>;
  }

  return <span className="readonly-field__display">{String(value)}</span>;
};

export const readonlyFieldType = {
  type: 'readonly',
  Input: ReadOnlyFieldTypeInput,
  Display: ReadOnlyFieldTypeDisplay,
  defaultConfig: {},
};

export const useReadOnlyField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ReadOnlyFieldTypeInput {...props} config={config} />,
    Display: (props) => <ReadOnlyFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
