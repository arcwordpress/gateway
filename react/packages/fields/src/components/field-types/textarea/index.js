import { createElement, useMemo } from '@wordpress/element';
import './style.css';

const TextareaFieldTypeInput = ({ config = {}, error, register, setValue, watch }) => {
    const name = config.name;
    if (!name) {
        console.warn('TextareaFieldTypeInput: No "name" provided in config');
        return null;
    }

    const {
        label = '',
        placeholder = '',
        help = '',
        rows = 5,
        default: defaultValue = ''
    } = config;

    return (
        <div className="textarea-field">
            {label && (
                <label htmlFor={name} className="textarea-field__label">
                    {label}
                </label>
            )}

            <textarea
                id={name}
                className="textarea-field__input"
                {...register(name)}
                defaultValue={defaultValue}
                rows={rows}
                placeholder={placeholder}
            />

            {help && <p className="textarea-field__help">{help}</p>}
            {error && <p className="textarea-field__error">{error.message}</p>}
        </div>
    );
};

const TextareaFieldTypeDisplay = ({ value, config }) => {
    if (!value || value.trim() === '') {
        return <span className="textarea-field__display textarea-field__display--empty">-</span>;
    }

    return (
        <div className="textarea-field__display">
            {value.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
            ))}
        </div>
    );
};

export const textareaFieldType = {
    type: 'textarea',
    Input: TextareaFieldTypeInput,
    Display: TextareaFieldTypeDisplay,
    defaultConfig: {
        label: '',
        placeholder: '',
        help: '',
        rows: 5,
        default: ''
    }
};

export const useTextareaField = (config) => {
    return useMemo(() => ({
        Input: (props) => <TextareaFieldTypeInput {...props} config={config} />,
        Display: (props) => <TextareaFieldTypeDisplay {...props} config={config} />
    }), [config]);
};

export default TextareaInput;
