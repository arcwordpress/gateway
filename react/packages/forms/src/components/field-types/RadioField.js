const RadioField = ({ fieldName, fieldConfig, register, error }) => {
  const options = fieldConfig.options || [];
  const layout = fieldConfig.layout || 'vertical'; // 'vertical' or 'horizontal'

  // Normalize options to {label, value} format
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={`${layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}`}>
        {normalizedOptions.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`${fieldName}-${index}`}
              value={option.value}
              {...register(fieldName)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <label
              htmlFor={`${fieldName}-${index}`}
              className="ml-2 text-sm text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {fieldConfig.helpText && (
        <p className="mt-2 text-sm text-gray-500">{fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default RadioField;
