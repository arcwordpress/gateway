import { useState, useEffect } from '@wordpress/element';

const RangeField = ({ fieldName, fieldConfig, register, error, setValue, watch }) => {
  const min = fieldConfig.min ?? 0;
  const max = fieldConfig.max ?? 100;
  const step = fieldConfig.step ?? 1;
  const defaultValue = fieldConfig.default ?? min;

  const [currentValue, setCurrentValue] = useState(defaultValue);

  // Watch for value changes from react-hook-form
  const watchedValue = watch ? watch(fieldName) : undefined;

  useEffect(() => {
    if (watchedValue !== undefined && watchedValue !== currentValue) {
      setCurrentValue(watchedValue);
    }
  }, [watchedValue]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    if (setValue) {
      setValue(fieldName, newValue);
    }
  };

  // Calculate percentage for visual feedback
  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="range"
              id={fieldName}
              {...register(fieldName, { valueAsNumber: true })}
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {(fieldConfig.showMinMax || fieldConfig.showMinMax === undefined) && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentValue}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldConfig.append && (
              <span className="text-sm text-gray-600">{fieldConfig.append}</span>
            )}
            {fieldConfig.prepend && (
              <span className="text-sm text-gray-600">{fieldConfig.prepend}</span>
            )}
          </div>
        </div>
      </div>

      {fieldConfig.helpText && (
        <p className="mt-1 text-sm text-gray-500">{fieldConfig.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default RangeField;
