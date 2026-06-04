import { useState, useEffect, useMemo } from 'react';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './time-picker-style.css';

export const TimePickerControl = ({ config = {} }) => {
    const { register, setValue, watch, formState } = useGatewayForm();
    const name = config.name;
    
    if (!name) {
        console.warn('TimePickerInput: No "name" provided in config');
        return null;
    }

    const fieldError = formState.errors[name];

    const {
        label = '',
        placeholder = '',
        help = '',
        default: defaultValue = '',
        timeIntervals = 15,
        timeFormat = 'h:mm aa',
        dateFormat = 'h:mm aa'
    } = config;

    const [selectedTime, setSelectedTime] = useState(null);
    const currentValue = watch(name);

    useEffect(() => {
        register(name);

        if (defaultValue && !currentValue) {
            setValue(name, defaultValue);
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
            setValue(name, `${hours}:${minutes}:${seconds}`, { shouldValidate: true });
        } else {
            setValue(name, '', { shouldValidate: true });
        }
    };

    return (
        <div className="time-picker-field">
            {label && (
                <label htmlFor={name} className="time-picker-field__label">
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
                className={`time-picker-field__input ${fieldError ? 'time-picker-field__input--error' : ''}`}
            />

            {help && <p className="time-picker-field__help">{help}</p>}
            {fieldError && <p className="time-picker-field__error">{fieldError.message}</p>}
        </div>
    );
};

const TimePickerFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<TimePickerControl config={config} />} />
    );
};

export const TimePickerFieldTypeDisplay = ({ value, config = {} }) => {
    const { label = '' } = config;

    if (!value) {
        return <span className="time-picker-field__display time-picker-field__display--empty">-</span>;
    }

    const formatTime = (timeString) => {
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

export const timePickerFieldType = {
    type: 'time-picker',
    Input: TimePickerFieldTypeInput,
    Display: TimePickerFieldTypeDisplay,
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

export const useTimePickerField = (config) => {
    return useMemo(() => ({
        Input: (props) => <TimePickerFieldTypeInput {...props} config={config} />,
        Display: (props) => <TimePickerFieldTypeDisplay {...props} config={config} />
    }), [config]);
};
