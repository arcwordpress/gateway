import { useEffect, useState, useRef, useMemo } from '@wordpress/element';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import './style.css';

const MarkdownFieldInput = ({ fieldName, fieldConfig, register, error, setValue, watch }) => {
  const [isReady, setIsReady] = useState(false);
  const currentValue = watch ? watch(fieldName) : '';
  const initialValue = useRef(currentValue || fieldConfig.default || '');

  useEffect(() => {
    if (register) {
      register(fieldName);
    }
    setIsReady(true);
  }, [fieldName, register]);

  useEffect(() => {
    if (fieldConfig.default && setValue && currentValue === undefined) {
      setValue(fieldName, fieldConfig.default);
    }
  }, []);

  const handleChange = (value) => {
    if (setValue) {
      setValue(fieldName, value, { shouldValidate: true });
    }
  };

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: fieldConfig.placeholder || 'Enter markdown text...',
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
    minHeight: fieldConfig.minHeight || '200px',
    maxHeight: fieldConfig.maxHeight || '500px',
  }), [fieldConfig.placeholder, fieldConfig.minHeight, fieldConfig.maxHeight]);

  if (!isReady) {
    return <div className="markdown-field__loading">Loading editor...</div>;
  }

  const wrapperClasses = ['markdown-field__wrapper'];
  if (error) {
    wrapperClasses.push('markdown-field__wrapper--error');
  }

  return (
    <div className="markdown-field">
      <label htmlFor={fieldName} className="markdown-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="markdown-field__required">*</span>}
      </label>
      {fieldConfig.helpText && (
        <p className="markdown-field__help">{fieldConfig.helpText}</p>
      )}
      <div className={wrapperClasses.join(' ')}>
        <SimpleMDE
          id={fieldName}
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
