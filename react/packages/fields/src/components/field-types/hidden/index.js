import { useMemo } from '@wordpress/element';
import './style.css';

const HiddenFieldTypeInput = ({ config = {}, register, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('HiddenFieldTypeInput: No "name" provided in props or config');
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

const HiddenFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="hidden-field__display hidden-field__display--empty">-</span>;
  }

  return <span className="hidden-field__display">{String(value)}</span>;
};

// Field Type Definition for registry
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
