const ReadOnlyField = ({ fieldName, fieldConfig, register }) => {
  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </label>
      <input
        type="text"
        id={fieldName}
        {...register(fieldName)}
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
      />
      {fieldConfig.help && (
        <p className="mt-1 text-sm text-gray-500">{fieldConfig.help}</p>
      )}
    </div>
  );
};

export default ReadOnlyField;
