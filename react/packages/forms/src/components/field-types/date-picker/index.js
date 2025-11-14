import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

// Input Component (for forms)
const DatePickerFieldTypeInput = ({ config = {}, error }) => {
  const { register, setValue, watch, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('DatePickerFieldTypeInput: No "name" provided in config');
    return null;
  }

  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    help,
    default: defaultValue = '',
    dateFormat = 'MM/dd/yyyy',
    placeholder = 'Select date...',
    minDate,
    maxDate,
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  // Set initial/default value only once on mount
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleChange = (date) => {
    setSelectedDate(date);

    // Format date as YYYY-MM-DD for database storage
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setValue(name, `${year}-${month}-${day}`, { shouldValidate: true });
    } else {
      setValue(name, '');
    }
  };

  return (
    <div className="date-picker-field">
      {/* Hidden input for form registration */}
      <input type="hidden" {...register(name)} />

      <label htmlFor={name} className="date-picker-field__label">
        {labelText}
        {required && <span className="date-picker-field__required">*</span>}
      </label>

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
        className={`date-picker-field__input ${fieldError ? 'date-picker-field__input--error' : ''}`}
      />

      {help && (
        <p className="date-picker-field__help">{help}</p>
      )}
      {fieldError && (
        <p className="date-picker-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const DatePickerFieldTypeDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="date-picker-field__display date-picker-field__display--empty">-</span>;
  }

  // Parse and format the date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return <span className="date-picker-field__display date-picker-field__display--invalid">Invalid date</span>;
  }

  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return <span className="date-picker-field__display">{formattedDate}</span>;
};

// Field Type Definition for registry
export const datePickerFieldType = {
  type: 'date-picker',
  Input: DatePickerFieldTypeInput,
  Display: DatePickerFieldTypeDisplay,
  defaultConfig: {
    dateFormat: 'MM/dd/yyyy',
    placeholder: 'Select date...',
  },
};

// Hook for easy usage
export const useDatePickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <DatePickerFieldTypeInput {...props} config={config} />,
    Display: (props) => <DatePickerFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
