import { useEffect, useState, useRef, useMemo } from '@wordpress/element';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import './style.css';

const MarkdownFieldInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('MarkdownFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    helpText,
    default: defaultValue = '',
    placeholder = 'Enter markdown text...',
    minHeight = '200px',
    maxHeight = '500px',
  } = config;

  const [isReady, setIsReady] = useState(false);
  const currentValue = watch ? watch(name) : '';
  const initialValue = useRef(currentValue || defaultValue);

  useEffect(() => {
    if (register) {
      register(name);
    }
    setIsReady(true);
  }, [name, register]);

  useEffect(() => {
    if (defaultValue && setValue && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  const handleChange = (value) => {
    if (setValue) {
      setValue(name, value, { shouldValidate: true });
    }
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
  if (error) {
    wrapperClasses.push('markdown-field__wrapper--error');
  }

  return (
    <div className="markdown-field">
      <label htmlFor={name} className="markdown-field__label">
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {required && <span className="markdown-field__required">*</span>}
      </label>
      {helpText && (
        <p className="markdown-field__help">{helpText}</p>
      )}
      <div className={wrapperClasses.join(' ')}>
        <SimpleMDE
          id={name}
          value={initialValue.current || ''}
          onChange={handleChange}
          options={editorOptions}
        />
      </div>
      {error && (
        <p className="markdown-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const MarkdownFieldDisplay = ({ value, config }) => {
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

export const markdownFieldDefinition = {
  type: 'markdown',
  Input: MarkdownFieldInput,
  Display: MarkdownFieldDisplay,
  defaultConfig: {
    minHeight: '200px',
    maxHeight: '500px',
  },
};

export const useMarkdownField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'markdown',
  };
};

export default MarkdownFieldInput;
