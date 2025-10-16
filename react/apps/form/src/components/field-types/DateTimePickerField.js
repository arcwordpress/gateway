import { useState, useEffect } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimePickerField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
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

  const timeIntervals = fieldConfig.timeIntervals || 15; // Default 15 min intervals

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

export default DateTimePickerField;
