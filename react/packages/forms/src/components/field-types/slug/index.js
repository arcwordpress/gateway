import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import './slug-style.css';

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

const SlugControl = ({ config = {} }) => {

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

  useEffect(() => {
    const subscription = watch((allValues, { name: changedName }) => {
      if (changedName === config.watchField) {
        setRerender(r => r + 1);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, config.watchField]);

  useEffect(() => {
    const subscription = watch((value, { name: changedName }) => {
      setRerender(r => r + 1);
    }, watchField);
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, watchField]);

  if (!name) {
    console.warn('[SlugField] No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];
  const currentValue = watch(name);
  const watchedValue = watch(watchField);

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

  const handleChange = (e) => {
    if (isManuallyEdited) {
      const masked = slugify(e.target.value);
      setValue(name, masked, { shouldValidate: true });
    }
  };

  const handleBlur = (e) => {
    if (isManuallyEdited) {
      const slugified = slugify(e.target.value);
      setValue(name, slugified, { shouldValidate: true });
    }
  };

  return (
    <div className="slug-field">
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
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUnlock}
            className="slug-field__unlock"
            title="Re-enable auto-generation"
            aria-label="Re-enable auto-generation from watched field"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
      </div>
      {!isManuallyEdited && watchField && (
        <p className="slug-field__info">
          Automatically generated.
        </p>
      )}
      {isManuallyEdited && (
        <p className="slug-field__info">
          Manual mode.
        </p>
      )}
    </div>
  );
};

const SlugFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<SlugControl config={config} />} />
    );
};

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

export const useSlugField = (config) => {
  return useMemo(() => ({
    Input: (props) => <SlugFieldTypeInput {...props} config={config} />,
    Display: (props) => <SlugFieldTypeDisplay {...props} config={config} />
  }), [config]);
};