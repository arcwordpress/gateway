import { useState, useEffect } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
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

  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="text-sm text-gray-500 mb-2">{fieldConfig.helpText}</p>
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
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default DatePickerField;
