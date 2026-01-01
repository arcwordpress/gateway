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
const SlugFieldTypeInput = ({ config = {} }) => {

  const {
    label,
    required = false,
    help = '',
    watchField = 'title',
    placeholder = '',
    prefix = '',
  } = config;

  const { register, setValue, watch, formState } = useGatewayForm();
  const name = config.name;
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [rerender, setRerender] = useState(0);

  // DEBUG: Subscribe to all form changes
  useEffect(() => {
    const subscription = watch((allValues, { name: changedName }) => {
      if (changedName === config.watchField) {
        setRerender(r => r + 1); // Force re-render when watched field changes
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, config.watchField]);

  // Subscribe only to the watched field
  useEffect(() => {
    const subscription = watch((value, { name: changedName }) => {
      setRerender(r => r + 1); // Force re-render when watched field changes
    }, watchField); // <-- Only subscribe to the specific field
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, watchField]);

  if (!name) {
    console.warn('[SlugField] No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];
  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentValue = watch(name);
  const watchedValue = watch(watchField);

  // Auto-generate slug from watched field
  useEffect(() => {
    if (!isManuallyEdited && watchedValue !== undefined) {
      const newSlug = slugify(watchedValue);
      if (newSlug !== currentValue) {
        setValue(name, newSlug, { shouldValidate: true });
      }
    }
  }, [watchedValue, isManuallyEdited, currentValue, name, setValue]);

  const handleEditClick = () => {
    setIsManuallyEdited(true);
  };

  const handleUnlock = () => {
    setIsManuallyEdited(false);
    if (watchedValue !== undefined) {
      setValue(name, slugify(watchedValue), { shouldValidate: true });
    }
  };

  // Always provide handlers, but only process in manual mode
  const handleChange = (e) => {
    if (isManuallyEdited) {
      const masked = slugify(e.target.value);
      setValue(name, masked, { shouldValidate: true });
    }
  };

  const handleBlur = (e) => {
    if (isManuallyEdited) {
      // Slugify the manually entered value
      const slugified = slugify(e.target.value);
      setValue(name, slugified, { shouldValidate: true });
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
          onBlur={handleBlur}
          placeholder={placeholder || `Auto-generated from ${watchField}`}
          className={`slug-field__input ${fieldError ? 'slug-field__input--error' : ''} ${isManuallyEdited ? 'slug-field__input--manual' : ''}`}
          readOnly={!isManuallyEdited}
          style={!isManuallyEdited ? { background: "#f9f9f9", cursor: "not-allowed" } : {}}
        />
        {!isManuallyEdited ? (
          <button
            type="button"
            onClick={handleEditClick}
            className="slug-field__edit"
            title="Edit slug manually"
            aria-label="Edit slug manually"
            style={{ marginLeft: 6 }}
          >
            ✏️
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUnlock}
            className="slug-field__unlock"
            title="Re-enable auto-generation"
            aria-label="Re-enable auto-generation from watched field"
            style={{ marginLeft: 6 }}
          >
            🔄
          </button>
        )}
      </div>

      {help && <p className="slug-field__help">{help}</p>}
      {!isManuallyEdited && watchField && (
        <p className="slug-field__info">
          Auto-generating from <strong>{watchField}</strong> field. Click ✏️ to edit manually.
        </p>
      )}
      {isManuallyEdited && (
        <p className="slug-field__info">
          Manual mode. Click 🔄 to resume auto-generation.
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