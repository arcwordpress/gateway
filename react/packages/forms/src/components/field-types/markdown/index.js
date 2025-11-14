import { useEffect, useState, useRef, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import './style.css';

const MarkdownFieldTypeInput = ({ config = {} }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('MarkdownFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultValue = '',
    placeholder = 'Enter markdown text...',
    minHeight = '200px',
    maxHeight = '500px',
  } = config;

  const [isReady, setIsReady] = useState(false);
  const currentValue = watch(name);
  const initialValue = useRef(currentValue || defaultValue);

  useEffect(() => {
    register(name);
    setIsReady(true);
  }, [name, register]);

  // Initialize value on mount
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleChange = (value) => {
    setValue(name, value, { shouldValidate: true });
  };

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder,
    status: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide'
    ],
    minHeight,
    maxHeight,
  }), [placeholder, minHeight, maxHeight]);

  if (!isReady) {
    return <div className="markdown-field__loading">Loading editor...</div>;
  }

  const wrapperClasses = ['markdown-field__wrapper'];
  if (fieldError) {
    wrapperClasses.push('markdown-field__wrapper--error');
  }

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="markdown-field">
      <label htmlFor={name} className="markdown-field__label">
        {labelText}
        {required && <span className="markdown-field__required">*</span>}
      </label>
      {help && (
        <p className="markdown-field__help">{help}</p>
      )}
      <div className={wrapperClasses.join(' ')}>
        <SimpleMDE
          id={name}
          value={initialValue.current || ''}
          onChange={handleChange}
          options={editorOptions}
        />
      </div>
      {fieldError && (
        <p className="markdown-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

const MarkdownFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="markdown-field__display markdown-field__display--empty">-</span>;
  }

  const truncatedValue = value.length > 100 ? value.substring(0, 100) + '...' : value;

  return (
    <span className="markdown-field__display" title={value}>
      {truncatedValue}
    </span>
  );
};

export const markdownFieldType = {
  type: 'markdown',
  Input: MarkdownFieldTypeInput,
  Display: MarkdownFieldTypeDisplay,
  defaultConfig: {
    minHeight: '200px',
    maxHeight: '500px',
  },
};

export const useMarkdownField = (config) => {
  return useMemo(() => ({
    Input: (props) => <MarkdownFieldTypeInput {...props} config={config} />,
    Display: (props) => <MarkdownFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
