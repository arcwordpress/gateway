import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import './style.css';

// Utility function to slugify a string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

// Input Component (for forms)
const SlugFieldTypeInput = ({ config = {}, error }) => {
  const { register, setValue, watch, formState } = useGatewayForm();
  const name = config.name;
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  if (!name) {
    console.warn('SlugFieldTypeInput: No "name" provided in config');
    return null;
  }

  const fieldError = error || formState.errors[name];

  const {
    label,
    required = false,
    help,
    watchField = 'title', // Default to watching 'title' field
    placeholder = '',
    prefix = '', // Optional prefix like '/blog/'
  } = config;

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentValue = watch(name);
  const watchedValue = watch(watchField);

  // Auto-generate slug from watched field
  useEffect(() => {
    // Only auto-generate if:
    // 1. User hasn't manually edited
    // 2. Field is not currently focused
    // 3. There's a value to watch
    if (!isManuallyEdited && !isFocused && watchedValue) {
      const newSlug = slugify(watchedValue);
      if (newSlug !== currentValue) {
        setValue(name, newSlug);
      }
    }
  }, [watchedValue, isManuallyEdited, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    // Slugify the manually entered value
    const slugified = slugify(e.target.value);
    setValue(name, slugified);
  };

  const handleChange = (e) => {
    // Mark as manually edited once user types
    if (!isManuallyEdited) {
      setIsManuallyEdited(true);
    }
    setValue(name, e.target.value);
  };

  const handleUnlock = () => {
    setIsManuallyEdited(false);
    // Immediately regenerate from watched field
    if (watchedValue) {
      setValue(name, slugify(watchedValue));
    }
  };

  return (
    <div className="slug-field">
      <label htmlFor={name} className="slug-field__label">
        {labelText}
        {required && <span className="slug-field__required">*</span>}
      </label>

      <div className="slug-field__input-wrapper">
        {prefix && (
          <span className="slug-field__prefix">{prefix}</span>
        )}
        <input
          type="text"
          id={name}
          {...register(name)}
          value={currentValue || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || `Auto-generated from ${watchField}`}
          className={`slug-field__input ${fieldError ? 'slug-field__input--error' : ''} ${isManuallyEdited ? 'slug-field__input--manual' : ''}`}
        />
        {isManuallyEdited && (
          <button
            type="button"
            onClick={handleUnlock}
            className="slug-field__unlock"
            title="Re-enable auto-generation"
            aria-label="Re-enable auto-generation from watched field"
          >
            🔓
          </button>
        )}
        {!isManuallyEdited && (
          <span className="slug-field__auto-indicator" title="Auto-generating from watched field">
            🔗
          </span>
        )}
      </div>

      {help && <p className="slug-field__help">{help}</p>}
      
      {!isManuallyEdited && watchField && (
        <p className="slug-field__info">
          Auto-generating from <strong>{watchField}</strong> field. Click to edit manually.
        </p>
      )}

      {fieldError && (
        <p className="slug-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const SlugFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="slug-field__display slug-field__display--empty">-</span>;
  }

  const { prefix = '' } = config || {};

  return (
    <span className="slug-field__display">
      {prefix && <span className="slug-field__display-prefix">{prefix}</span>}
      {String(value)}
    </span>
  );
};

// Field Type Definition for registry
export const slugFieldType = {
  type: 'slug',
  Input: SlugFieldTypeInput,
  Display: SlugFieldTypeDisplay,
  defaultConfig: {
    watchField: 'title',
    prefix: '',
    placeholder: '',
  },
};

// Hook for easy usage
export const useSlugField = (config) => {
  return useMemo(() => ({
    Input: (props) => <SlugFieldTypeInput {...props} config={config} />,
    Display: (props) => <SlugFieldTypeDisplay {...props} config={config} />
  }), [config]);
};