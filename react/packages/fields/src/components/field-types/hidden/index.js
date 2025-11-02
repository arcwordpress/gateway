import './style.css';

const HiddenFieldInput = ({ fieldName, fieldConfig, register }) => {
  const fieldValue = fieldConfig.value || fieldConfig.default || '';

  return (
    <input
      type="hidden"
      id={fieldName}
      {...register(fieldName)}
      defaultValue={fieldValue}
      className="hidden-field__input"
    />
  );
};

export const HiddenFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="hidden-field__display hidden-field__display--empty">-</span>;
  }

  return <span className="hidden-field__display">{String(value)}</span>;
};

export const hiddenFieldDefinition = {
  type: 'hidden',
  Input: HiddenFieldInput,
  Display: HiddenFieldDisplay,
  defaultConfig: {},
};

export const useHiddenField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'hidden',
  };
};

export default HiddenFieldInput;
