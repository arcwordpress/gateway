import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker-style.css';

const DatePickerControl = ({ config = {}, error }) => {
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

  const currentValue = watch(name);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [currentValue]);

  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleChange = (date) => {

    setSelectedDate(date);
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
      <input type="hidden" {...register(name)} />
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
    </div>
  );
};

const DatePickerFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<DatePickerControl config={config} />} />
    );
};

const DatePickerFieldTypeDisplay = ({ value, config }) => {

  if (value === null || value === undefined || value === '') {
    return <span className="date-picker-field__display date-picker-field__display--empty">-</span>;
  }

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

export const datePickerFieldType = {
  type: 'date-picker',
  Input: DatePickerFieldTypeInput,
  Display: DatePickerFieldTypeDisplay,
  defaultConfig: {
    dateFormat: 'MM/dd/yyyy',
    placeholder: 'Select date...',
  },
};

export const useDatePickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <DatePickerFieldTypeInput {...props} config={config} />,
    Display: (props) => <DatePickerFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
