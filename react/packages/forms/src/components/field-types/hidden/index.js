import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './hidden-style.css';

const HiddenControl = ({ config = {} }) => {

  const { register } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('Hidden Field: No "name" provided in config');
    return null;
  }

  const fieldValue = config.value || config.default || '';

  return (
    <input
      type="hidden"
      id={name}
      {...register(name)}
      defaultValue={fieldValue}
      className="hidden-field__input"
    />
  );
};

const HiddenFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<HiddenControl config={config} />} />
    );
};

const HiddenFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="hidden-field__display hidden-field__display--empty">-</span>;
  }

  return <span className="hidden-field__display">{String(value)}</span>;
};

export const hiddenFieldType = {
  type: 'hidden',
  Input: HiddenFieldTypeInput,
  Display: HiddenFieldTypeDisplay,
  defaultConfig: {
    value: '',
    default: ''
  },
};

// Hook for easy usage
export const useHiddenField = (config) => {
  return useMemo(() => ({
    Input: (props) => <HiddenFieldTypeInput {...props} config={config} />,
    Display: (props) => <HiddenFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
