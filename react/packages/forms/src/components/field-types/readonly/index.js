import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

const ReadOnlyFieldTypeInput = ({ config = {} }) => {
  const { register, watch } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('ReadOnlyFieldTypeInput: No "name" provided in config');
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

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="readonly-field">
      <label htmlFor={name} className="readonly-field__label">
        {labelText}
      </label>
      <input
        type="text"
        id={name}
        {...register(name)}
        value={fieldValue}
        readOnly
        className="readonly-field__input"
      />
      {help && (
        <p className="readonly-field__help">{help}</p>
      )}
    </div>
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
