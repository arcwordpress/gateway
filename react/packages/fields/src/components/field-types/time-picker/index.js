import { createElement } from '@wordpress/element';
import { useState, useEffect } from '@wordpress/element';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style.css';

/**
 * TimePickerInput Component
 * Renders a time picker field using react-datepicker
 */
export const TimePickerInput = ({ fieldName, fieldConfig = {}, register, setValue, watch, error }) => {
    const {
        label = '',
        placeholder = '',
        help = '',
        default: defaultValue = '',
        timeIntervals = 15,
        timeFormat = 'h:mm aa',
        dateFormat = 'h:mm aa'
    } = fieldConfig;

    const [selectedTime, setSelectedTime] = useState(null);
    const currentValue = watch(fieldName);

    // Initialize value on mount
    useEffect(() => {
        register(fieldName);

        if (defaultValue && !currentValue) {
            setValue(fieldName, defaultValue);
        }

        if (currentValue) {
            const [hours, minutes] = currentValue.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            setSelectedTime(date);
        }
    }, []);

    useEffect(() => {
        if (currentValue && currentValue !== selectedTime) {
            const [hours, minutes] = currentValue.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            setSelectedTime(date);
        }
    }, [currentValue]);

    const handleChange = (date) => {
        setSelectedTime(date);
        if (date) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = '00';
            setValue(fieldName, `${hours}:${minutes}:${seconds}`);
        } else {
            setValue(fieldName, '');
        }
    };

    return (
        <div className="time-picker-field">
            {label && (
                <label htmlFor={fieldName} className="time-picker-field__label">
                    {label}
                </label>
            )}

            <DatePicker
                selected={selectedTime}
                onChange={handleChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={timeIntervals}
                timeCaption="Time"
                dateFormat={dateFormat}
                placeholderText={placeholder}
                className="time-picker-field__input"
            />

            {help && <p className="time-picker-field__help">{help}</p>}
            {error && <p className="time-picker-field__error">{error.message}</p>}
        </div>
    );
};

/**
 * TimePickerDisplay Component
 * Displays time value in formatted string
 */
export const TimePickerDisplay = ({ value, fieldConfig = {} }) => {
    const { label = '' } = fieldConfig;

    const formatTime = (timeString) => {
        if (!timeString) return 'No time selected';

        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="time-picker-field">
            {label && <span className="time-picker-field__label">{label}</span>}
            <div className="time-picker-field__display">
                {formatTime(value)}
            </div>
        </div>
    );
};

/**
 * Field Definition for Registry
 */
export const timePickerFieldDefinition = {
    type: 'time-picker',
    Input: TimePickerInput,
    Display: TimePickerDisplay,
    defaultConfig: {
        label: '',
        placeholder: '',
        help: '',
        default: '',
        timeIntervals: 15,
        timeFormat: 'h:mm aa',
        dateFormat: 'h:mm aa'
    }
};

/**
 * Custom Hook for Time Picker Field
 */
export const useTimePickerField = (fieldName, fieldConfig, formMethods) => {
    const { watch, setValue } = formMethods;
    const value = watch(fieldName);

    const clearTime = () => {
        setValue(fieldName, '');
    };

    return {
        value,
        clearTime,
        hasValue: !!value
    };
};

export default TimePickerInput;
