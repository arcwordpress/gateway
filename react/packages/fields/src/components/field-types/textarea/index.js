import { createElement } from '@wordpress/element';
import './style.css';

/**
 * TextareaInput Component
 * Renders a textarea input field for multi-line text entry
 */
export const TextareaInput = ({ config = {}, error, register, setValue, watch }) => {
    const name = config.name;
    if (!name) {
        console.warn('TextareaInput: No "name" provided in config');
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

/**
 * TextareaDisplay Component
 * Displays textarea content in a formatted pre-wrap display
 */
export const TextareaDisplay = ({ value, fieldConfig = {} }) => {
    const { label = '' } = fieldConfig;

    return (
        <div className="textarea-field">
            {label && <span className="textarea-field__label">{label}</span>}
            <div className="textarea-field__display">
                {value || <span className="textarea-field__display--empty">No content</span>}
            </div>
        </div>
    );
};

/**
 * Field Definition for Registry
 */
export const textareaFieldDefinition = {
    type: 'textarea',
    Input: TextareaInput,
    Display: TextareaDisplay,
    defaultConfig: {
        label: '',
        placeholder: '',
        help: '',
        rows: 5,
        default: ''
    }
};

/**
 * Custom Hook for Textarea Field
 */
export const useTextareaField = (fieldName, fieldConfig, formMethods) => {
    const { register, watch } = formMethods;
    const value = watch(fieldName);

    return {
        value,
        register,
        isEmpty: !value || value.trim() === ''
    };
};

export default TextareaInput;
