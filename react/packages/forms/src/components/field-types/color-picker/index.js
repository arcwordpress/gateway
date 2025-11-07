import { useState, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

// Input Component (for forms)
const ColorPickerFieldTypeInput = ({ config = {}, error }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('ColorPickerFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Use error from props if provided, otherwise from formState
  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    swatches: customSwatches,
    showSwatches = true,
    default: defaultValue = '#000000',
    help = '',
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentValue = watch(name) || defaultValue;
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (e) => {
    const color = e.target.value;
    setValue(name, color, { shouldValidate: true });
  };

  const defaultSwatches = [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const swatches = customSwatches || defaultSwatches;

  return (
    <div className="color-picker-field">
      <label className="color-picker-field__label">
        {labelText}
        {required && <span className="color-picker-field__required">*</span>}
      </label>

      {/* Hidden input for form registration */}
      <input type="hidden" {...register(name)} />

      <div className="color-picker-field__controls">
        {/* Color preview with picker */}
        <div className="color-picker-field__preview-container">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className={`color-picker-field__preview ${fieldError ? 'color-picker-field__preview--error' : ''}`}
            style={{ backgroundColor: currentValue }}
            aria-label="Pick color"
          />

          {showPicker && (
            <>
              <div
                className="color-picker-field__overlay"
                onClick={() => setShowPicker(false)}
              />
              <div className="color-picker-field__popup">
                <input
                  type="color"
                  value={currentValue}
                  onChange={handleColorChange}
                  className="color-picker-field__picker"
                />
              </div>
            </>
          )}
        </div>

        {/* Text input for manual entry */}
        <div className="color-picker-field__input-wrapper">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => {
              const color = e.target.value;
              setValue(name, color, { shouldValidate: true });
            }}
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            className={`color-picker-field__input ${fieldError ? 'color-picker-field__input--error' : ''}`}
          />
        </div>

        {/* Common color swatches */}
        {showSwatches && (
          <div className="color-picker-field__swatches">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setValue(name, color, { shouldValidate: true });
                }}
                className={`color-picker-field__swatch ${
                  currentValue?.toUpperCase() === color.toUpperCase()
                    ? 'color-picker-field__swatch--selected'
                    : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        )}
      </div>

      {help && (
        <p className="color-picker-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="color-picker-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const ColorPickerFieldTypeDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="color-picker-field__display color-picker-field__display--empty">-</span>;
  }

  return (
    <span className="color-picker-field__display">
      <span
        className="color-picker-field__display-swatch"
        style={{ backgroundColor: value }}
        aria-label={value}
      />
      <span className="color-picker-field__display-value">{value}</span>
    </span>
  );
};

// Field Type Definition for registry
export const colorPickerFieldType = {
  type: 'color-picker',
  Input: ColorPickerFieldTypeInput,
  Display: ColorPickerFieldTypeDisplay,
  defaultConfig: {
    default: '#000000',
    showSwatches: true,
  },
};

// Hook for easy usage
export const useColorPickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ColorPickerFieldTypeInput {...props} config={config} />,
    Display: (props) => <ColorPickerFieldTypeDisplay {...props} config={config} />
  }), [config]);
};