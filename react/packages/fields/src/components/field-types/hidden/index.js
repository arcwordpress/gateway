import './style.css';

const HiddenFieldInput = ({ config = {}, register, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('HiddenFieldInput: No "name" provided in props or config');
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
