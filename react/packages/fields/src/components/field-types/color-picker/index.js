import { useState, useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const ColorPickerFieldInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('ColorPickerFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    swatches: customSwatches,
    showSwatches = true,
    default: defaultValue = '#000000',
  } = config;

  const currentValue = watch ? watch(name) : defaultValue;
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (setValue) {
      setValue(name, color, { shouldValidate: true });
    }
  };

  const defaultSwatches = [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const swatches = customSwatches || defaultSwatches;

  return (
    <div className="color-picker-field">
      <label className="color-picker-field__label">
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            className={`color-picker-field__preview ${error ? 'color-picker-field__preview--error' : ''}`}
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
              if (setValue) {
                setValue(name, color, { shouldValidate: true });
              }
            }}
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            className={`color-picker-field__input ${error ? 'color-picker-field__input--error' : ''}`}
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
                  if (setValue) {
                    setValue(name, color, { shouldValidate: true });
                  }
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

      {config.helpText && (
        <p className="color-picker-field__help">{config.helpText}</p>
      )}
      {error && (
        <p className="color-picker-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const ColorPickerFieldDisplay = ({ value, config }) => {
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

// Field Definition for registry
export const colorPickerFieldDefinition = {
  type: 'color-picker',
  Input: ColorPickerFieldInput,
  Display: ColorPickerFieldDisplay,
  defaultConfig: {
    default: '#000000',
    showSwatches: true,
  },
};

// Hook for easy usage
export const useColorPickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ColorPickerFieldInput {...props} config={config} />,
    Display: (props) => <ColorPickerFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const ColorPickerField = ColorPickerFieldInput;
export default ColorPickerField;
