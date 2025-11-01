const CheckboxField = ({ fieldName, fieldConfig, register, error }) => {
  return (
    <div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={fieldName}
          {...register(fieldName)}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <label
          htmlFor={fieldName}
          className="ml-2 block text-sm font-medium text-gray-700"
        >
          {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default CheckboxField;
