import { useState, useEffect, useMemo } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

// Input Component (for forms)
const DateTimePickerFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  // Parse initial value (expects MySQL datetime format: YYYY-MM-DD HH:MM:SS)
  useEffect(() => {
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDateTime(date);
      }
    }
  }, [currentValue]);

  const handleChange = (date) => {
    setSelectedDateTime(date);

    // Format datetime as YYYY-MM-DD HH:MM:SS for database storage
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      setValue(fieldName, `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    } else {
      setValue(fieldName, '');
    }
  };

  // Register the field with react-hook-form
  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  // Initialize value on mount
  useEffect(() => {
    if (setValue && currentValue === undefined) {
      setValue(fieldName, fieldConfig.default || '');
    }
  }, []);

  const timeIntervals = fieldConfig.timeIntervals || 15; // Default 15 min intervals

  return (
    <div className="datetime-picker-field">
      <label
        htmlFor={fieldName}
        className="datetime-picker-field__label"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="datetime-picker-field__required">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="datetime-picker-field__help">{fieldConfig.helpText}</p>
      )}

      <DatePicker
        selected={selectedDateTime}
        onChange={handleChange}
        showTimeSelect
        timeIntervals={timeIntervals}
        timeCaption="Time"
        dateFormat={fieldConfig.dateTimeFormat || 'MM/dd/yyyy h:mm aa'}
        placeholderText={fieldConfig.placeholder || 'Select date and time...'}
        minDate={fieldConfig.minDate ? new Date(fieldConfig.minDate) : null}
        maxDate={fieldConfig.maxDate ? new Date(fieldConfig.maxDate) : null}
        isClearable={!fieldConfig.required}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className={`datetime-picker-field__input ${error ? 'datetime-picker-field__input--error' : ''}`}
      />

      {error && (
        <p className="datetime-picker-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const DateTimePickerFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="datetime-picker-field__display datetime-picker-field__display--empty">-</span>;
  }

  // Parse and format the datetime
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return <span className="datetime-picker-field__display datetime-picker-field__display--invalid">Invalid date</span>;
  }

  const formattedDateTime = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return <span className="datetime-picker-field__display">{formattedDateTime}</span>;
};

// Field Definition for registry
export const dateTimePickerFieldDefinition = {
  type: 'datetime-picker',
  Input: DateTimePickerFieldInput,
  Display: DateTimePickerFieldDisplay,
  defaultConfig: {
    dateTimeFormat: 'MM/dd/yyyy h:mm aa',
    placeholder: 'Select date and time...',
    timeIntervals: 15,
  },
};

// Hook for easy usage
export const useDateTimePickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <DateTimePickerFieldInput {...props} config={config} />,
    Display: (props) => <DateTimePickerFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const DateTimePickerField = DateTimePickerFieldInput;
export default DateTimePickerField;
