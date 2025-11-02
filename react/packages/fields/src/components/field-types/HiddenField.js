const HiddenField = ({ fieldName, fieldConfig, register }) => {
  const fieldValue = fieldConfig.value || fieldConfig.default || '';

  return (
    <input
      type="hidden"
      id={fieldName}
      {...register(fieldName)}
      defaultValue={fieldValue}
    />
  );
};

export default HiddenField;
