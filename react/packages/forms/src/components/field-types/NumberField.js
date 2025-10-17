const NumberField = ({ fieldName, fieldConfig, register, error }) => {
  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        id={fieldName}
        {...register(fieldName, { valueAsNumber: true })}
        placeholder={fieldConfig.placeholder || ''}
        min={fieldConfig.min}
        max={fieldConfig.max}
        step={fieldConfig.step || 'any'}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {fieldConfig.helpText && (
        <p className="mt-1 text-sm text-gray-500">{fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default NumberField;
