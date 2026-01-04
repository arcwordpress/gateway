import { useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './textarea-style.css';

const TextareaControl = ({ config = {} }) => {

    const { register, formState } = useGatewayForm();
    const name = config.name;
    
    if (!name) {
        console.warn('TextareaFieldTypeInput: No "name" provided in config');
        return null;
    }

    // Get errors for this field.
    const fieldError = formState.errors[name];

    const {
        label = '',
        placeholder = '',
        help = '',
        rows = 5,
        default: defaultValue = ''
    } = config;

    const textareaClasses = ['textarea-field__input'];
    if (fieldError) {
        textareaClasses.push('textarea-field__input--error');
    }

    return (
        <div className="gty-field-control gty-textarea-field-control">
            <textarea
                id={name}
                className={textareaClasses.join(' ')}
                {...register(name)}
                defaultValue={defaultValue}
                rows={rows}
                placeholder={placeholder}
            />
        </div>
    );

};

const TextareaFieldTypeInput = ({ config = {} }) => {

    return ( 
        <Field config={config} fieldControl={<TextareaControl config={config} />} />
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