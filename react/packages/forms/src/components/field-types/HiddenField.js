const HiddenField = ({ fieldName, fieldConfig, register }) => {
  return (
    <input
      type="hidden"
      id={fieldName}
      {...register(fieldName)}
      value={fieldConfig.value || ''}
    />
  );
};

export default HiddenField;
