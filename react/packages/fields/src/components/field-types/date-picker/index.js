import { useState, useEffect, useMemo } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

// Input Component (for forms)
const DatePickerFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
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
      setValue(fieldName, `${year}-${month}-${day}`);
    } else {
      setValue(fieldName, '');
    }
  };

  // Register the field with react-hook-form
  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  // Set initial/default value only once on mount
  useEffect(() => {
    if (setValue && currentValue === undefined) {
      const initialValue = fieldConfig.default || '';
      setValue(fieldName, initialValue);
    }
  }, []);

  return (
    <div className="date-picker-field">
      <label
        htmlFor={fieldName}
        className="date-picker-field__label"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="date-picker-field__required">*</span>}
      </label>

      {(fieldConfig.help || fieldConfig.helpText) && (
        <p className="date-picker-field__help">{fieldConfig.help || fieldConfig.helpText}</p>
      )}

      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat={fieldConfig.dateFormat || 'MM/dd/yyyy'}
        placeholderText={fieldConfig.placeholder || 'Select date...'}
        minDate={fieldConfig.minDate ? new Date(fieldConfig.minDate) : null}
        maxDate={fieldConfig.maxDate ? new Date(fieldConfig.maxDate) : null}
        isClearable={!fieldConfig.required}
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
