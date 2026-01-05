import { useState, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './color-picker-style.css';

const ColorPickerControl = ({ config = {} }) => {

  const { register, setValue, watch, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('Color Picker: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    swatches: customSwatches,
    showSwatches = true,
    default: defaultValue = '#000000',
    help = '',
  } = config;

  const currentValue = watch(name) || defaultValue;
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (e) => {
    const color = e.target.value;
    setValue(name, color, { shouldValidate: true });
  };

  const defaultSwatches = [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B',
  ];

  const swatches = customSwatches || defaultSwatches;

  return (
    <div className="color-picker-field">
      <input type="hidden" {...register(name)} />
      <div className="color-picker-field__controls">
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
    </div>
  );
};

const ColorPickerFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<ColorPickerControl config={config} />} />
    );
};

const ColorPickerFieldTypeDisplay = ({ value, config }) => {
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

export const colorPickerFieldType = {
  type: 'color-picker',
  Input: ColorPickerFieldTypeInput,
  Display: ColorPickerFieldTypeDisplay,
  defaultConfig: {
    default: '#000000',
    showSwatches: true,
  },
};

export const useColorPickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ColorPickerFieldTypeInput {...props} config={config} />,
    Display: (props) => <ColorPickerFieldTypeDisplay {...props} config={config} />
  }), [config]);
};