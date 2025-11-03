import { useState, useEffect, useMemo } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

// Input Component (for forms)
const DatePickerFieldInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('DatePickerFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    help,
    helpText,
    default: defaultValue = '',
    dateFormat = 'MM/dd/yyyy',
    placeholder = 'Select date...',
    minDate,
    maxDate,
  } = config;

  const currentValue = watch(name);
  const [selectedDate, setSelectedDate] = useState(null);

  // Parse initial value
  useEffect(() => {
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [currentValue]);

  const handleChange = (date) => {
    setSelectedDate(date);

    // Format date as YYYY-MM-DD for database storage
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setValue(name, `${year}-${month}-${day}`);
    } else {
      setValue(name, '');
    }
  };

  // Register the field with react-hook-form
  useEffect(() => {
    register(name);
  }, [name, register]);

  // Set initial/default value only once on mount
  useEffect(() => {
    if (setValue && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  return (
    <div className="date-picker-field">
      <label
        htmlFor={name}
        className="date-picker-field__label"
      >
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {required && <span className="date-picker-field__required">*</span>}
      </label>

      {(help || helpText) && (
        <p className="date-picker-field__help">{help || helpText}</p>
      )}

      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat={dateFormat}
        placeholderText={placeholder}
        minDate={minDate ? new Date(minDate) : null}
        maxDate={maxDate ? new Date(maxDate) : null}
        isClearable={!required}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className={`date-picker-field__input ${error ? 'date-picker-field__input--error' : ''}`}
      />

      {error && (
        <p className="date-picker-field__error">{error.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const DatePickerFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="date-picker-field__display date-picker-field__display--empty">-</span>;
  }

  // Parse and format the date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return <span className="date-picker-field__display date-picker-field__display--invalid">Invalid date</span>;
  }

  const dateFormat = config?.dateFormat || 'MM/dd/yyyy';
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return <span className="date-picker-field__display">{formattedDate}</span>;
};

// Field Definition for registry
export const datePickerFieldDefinition = {
  type: 'date-picker',
  Input: DatePickerFieldInput,
  Display: DatePickerFieldDisplay,
  defaultConfig: {
    dateFormat: 'MM/dd/yyyy',
    placeholder: 'Select date...',
  },
};

// Hook for easy usage
export const useDatePickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <DatePickerFieldInput {...props} config={config} />,
    Display: (props) => <DatePickerFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const DatePickerField = DatePickerFieldInput;
export default DatePickerField;
