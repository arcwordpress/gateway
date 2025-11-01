import { useState } from '@wordpress/element';

const ColorPickerField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch ? watch(fieldName) : (fieldConfig.default || '#000000');
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (setValue) {
      setValue(fieldName, color, { shouldValidate: true });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden input for form registration */}
      <input type="hidden" {...register(fieldName)} />

      <div className="flex items-center gap-3">
        {/* Color preview with picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className={`w-12 h-12 rounded-md border-2 shadow-sm cursor-pointer transition-all hover:scale-105 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ backgroundColor: currentValue }}
            aria-label="Pick color"
          />

          {showPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPicker(false)}
              />
              <div className="absolute z-20 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                <input
                  type="color"
                  value={currentValue}
                  onChange={handleColorChange}
                  className="w-48 h-48 cursor-pointer border-0"
                />
              </div>
            </>
          )}
        </div>

        {/* Text input for manual entry */}
        <div className="flex-1">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => {
              const color = e.target.value;
              if (setValue) {
                setValue(fieldName, color, { shouldValidate: true });
              }
            }}
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            className={`w-full px-3 py-2 border rounded-md font-mono uppercase focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Common color swatches */}
        {(fieldConfig.showSwatches || fieldConfig.showSwatches === undefined) && (
          <div className="flex gap-1">
            {(fieldConfig.swatches || [
              '#000000', '#FFFFFF', '#EF4444', '#F59E0B',
              '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
            ]).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  if (setValue) {
                    setValue(fieldName, color, { shouldValidate: true });
                  }
                }}
                className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                  currentValue?.toUpperCase() === color.toUpperCase()
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        )}
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

export default ColorPickerField;
