import { useState, useEffect } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TimePickerField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [selectedTime, setSelectedTime] = useState(null);

  // Parse initial value (HH:MM:SS or HH:MM format)
  useEffect(() => {
    if (currentValue) {
      // Create a date object with today's date and the specified time
      const [hours, minutes] = currentValue.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(0);

      if (!isNaN(date.getTime())) {
        setSelectedTime(date);
      }
    }
  }, [currentValue]);

  const handleChange = (date) => {
    setSelectedTime(date);

    // Format time as HH:MM:SS for database storage
    if (date) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = '00';
      setValue(fieldName, `${hours}:${minutes}:${seconds}`);
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
        selected={selectedTime}
        onChange={handleChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={timeIntervals}
        timeCaption="Time"
        dateFormat={fieldConfig.timeFormat || 'h:mm aa'}
        placeholderText={fieldConfig.placeholder || 'Select time...'}
        isClearable={!fieldConfig.required}
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

export default TimePickerField;
