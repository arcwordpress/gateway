import { useState, useEffect, useMemo } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

// Input Component (for forms)
const DateTimePickerFieldInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('DateTimePickerFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    helpText,
    default: defaultValue = '',
    timeIntervals = 15,
    dateTimeFormat = 'MM/dd/yyyy h:mm aa',
    placeholder = 'Select date and time...',
    minDate,
    maxDate,
  } = config;

  const currentValue = watch(name);
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
      setValue(name, `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    } else {
      setValue(name, '');
    }
  };

  // Register the field with react-hook-form
  useEffect(() => {
    register(name);
  }, [name, register]);

  // Initialize value on mount
  useEffect(() => {
    if (setValue && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  return (
    <div className="datetime-picker-field">
      <label
        htmlFor={name}
        className="datetime-picker-field__label"
      >
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {required && <span className="datetime-picker-field__required">*</span>}
      </label>

      {helpText && (
        <p className="datetime-picker-field__help">{helpText}</p>
      )}

      <DatePicker
        selected={selectedDateTime}
        onChange={handleChange}
        showTimeSelect
        timeIntervals={timeIntervals}
        timeCaption="Time"
        dateFormat={dateTimeFormat}
        placeholderText={placeholder}
        minDate={minDate ? new Date(minDate) : null}
        maxDate={maxDate ? new Date(maxDate) : null}
        isClearable={!required}
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
