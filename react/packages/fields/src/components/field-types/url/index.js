import { createElement } from '@wordpress/element';
import './style.css';

/**
 * URLInput Component
 * Renders a URL input field with HTML5 validation
 */
export const URLInput = ({ config = {}, error, register, setValue, watch }) => {
    const name = config.name;
    if (!name) {
        console.warn('URLInput: No "name" provided in config');
        return null;
    }

    const {
        label = '',
        placeholder = 'https://example.com',
        help = '',
        default: defaultValue = ''
    } = config;

    return (
        <div className="url-field">
            {label && (
                <label htmlFor={name} className="url-field__label">
                    {label}
                </label>
            )}

            <input
                type="url"
                id={name}
                className="url-field__input"
                {...register(name)}
                defaultValue={defaultValue}
                placeholder={placeholder}
            />

            {help && <p className="url-field__help">{help}</p>}
            {error && <p className="url-field__error">{error.message}</p>}
        </div>
    );
};

/**
 * URLDisplay Component
 * Displays URL as a clickable link
 */
export const URLDisplay = ({ value, fieldConfig = {} }) => {
    const { label = '' } = fieldConfig;

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    return (
        <div className="url-field">
            {label && <span className="url-field__label">{label}</span>}
            <div className="url-field__display">
                {value && isValidUrl(value) ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-field__link"
                    >
                        {value}
                    </a>
                ) : (
                    <span className="url-field__display--empty">No URL provided</span>
                )}
            </div>
        </div>
    );
};

/**
 * Field Definition for Registry
 */
export const urlFieldDefinition = {
    type: 'url',
    Input: URLInput,
    Display: URLDisplay,
    defaultConfig: {
        label: '',
        placeholder: 'https://example.com',
        help: '',
        default: ''
    }
};

/**
 * Custom Hook for URL Field
 */
export const useURLField = (fieldName, fieldConfig, formMethods) => {
    const { register, watch } = formMethods;
    const value = watch(fieldName);

    const isValid = (url) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    };

    return {
        value,
        register,
        isValid: value ? isValid(value) : false,
        isEmpty: !value
    };
};

export default URLInput;
