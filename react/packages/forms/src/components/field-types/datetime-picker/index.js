import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datetime-picker-style.css';

const DateTimePickerControl = ({ config = {} }) => {
  
  const { register, setValue, watch, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('Date Time Picker Field: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help,
    default: defaultValue = '',
    timeIntervals = 15,
    dateTimeFormat = 'MM/dd/yyyy h:mm aa',
    placeholder = 'Select date and time...',
    minDate,
    maxDate,
  } = config;

  const currentValue = watch(name);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  useEffect(() => {
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDateTime(date);
      }
    }
  }, [currentValue]);

  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleChange = (date) => {
    setSelectedDateTime(date);

    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      setValue(name, `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`, { shouldValidate: true });
    } else {
      setValue(name, '');
    }
  };

  return (
    <div className="datetime-picker-field">
      <input type="hidden" {...register(name)} />
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
        className={`datetime-picker-field__input ${fieldError ? 'datetime-picker-field__input--error' : ''}`}
      />
    </div>
  );
};

const DateTimePickerFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<DateTimePickerControl config={config} />} />
    );
};

const DateTimePickerFieldTypeDisplay = ({ value, config }) => {

  if (value === null || value === undefined || value === '') {
    return <span className="datetime-picker-field__display datetime-picker-field__display--empty">-</span>;
  }

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

export const dateTimePickerFieldType = {
  type: 'datetime-picker',
  Input: DateTimePickerFieldTypeInput,
  Display: DateTimePickerFieldTypeDisplay,
  defaultConfig: {
    dateTimeFormat: 'MM/dd/yyyy h:mm aa',
    placeholder: 'Select date and time...',
    timeIntervals: 15,
  },
};

export const useDateTimePickerField = (config) => {
  return useMemo(() => ({
    Input: (props) => <DateTimePickerFieldTypeInput {...props} config={config} />,
    Display: (props) => <DateTimePickerFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
