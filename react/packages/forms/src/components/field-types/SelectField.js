const SelectField = ({ fieldName, fieldConfig, register, error }) => {
  // Handle options as array or convert object to array
  let options = fieldConfig.options || [];

  // If options is an object (key-value pairs), convert to array format
  if (!Array.isArray(options) && typeof options === 'object') {
    options = Object.entries(options).map(([value, label]) => ({
      value,
      label
    }));
  }

  const placeholder = fieldConfig.placeholder || 'Select an option';

  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={fieldName}
        {...register(fieldName)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          // Handle both string arrays and object arrays
          const value = typeof option === 'object' ? option.value : option;
          const label = typeof option === 'object' ? option.label : option;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default SelectField;
