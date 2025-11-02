import { useState, useEffect } from '@wordpress/element';
import './style.css';

const LinkFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [isEditing, setIsEditing] = useState(false);
  const [linkData, setLinkData] = useState({
    url: '',
    title: '',
    target: '_self',
  });

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  // Initialize value on mount
  useEffect(() => {
    if (setValue && currentValue === undefined) {
      setValue(fieldName, fieldConfig.default || '');
    }
  }, []);

  useEffect(() => {
    if (currentValue) {
      try {
        const data = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
        if (data && typeof data === 'object') {
          setLinkData({
            url: data.url || '',
            title: data.title || '',
            target: data.target || '_self',
          });
        }
      } catch (err) {
        console.error('Error parsing link value:', err);
      }
    }
  }, [currentValue]);

  const updateFormValue = (data) => {
    if (data.url) {
      setValue(fieldName, JSON.stringify(data));
    } else {
      setValue(fieldName, '');
    }
  };

  const handleChange = (field, value) => {
    const newData = { ...linkData, [field]: value };
    setLinkData(newData);
    updateFormValue(newData);
  };

  const handleSave = () => {
    if (linkData.url) {
      updateFormValue(linkData);
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    setLinkData({
      url: '',
      title: '',
      target: '_self',
    });
    setValue(fieldName, '');
    setIsEditing(false);
  };

  const hasLink = linkData.url && !isEditing;

  const containerClasses = ['link-field__container'];
  if (error) {
    containerClasses.push('link-field__container--error');
  }

  return (
    <div className="link-field">
      <label htmlFor={fieldName} className="link-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="link-field__required">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="link-field__help">{fieldConfig.helpText}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {hasLink ? (
          <div className="link-field__preview">
            <div className="link-field__link-info">
              <div className="link-field__link-icon">
                <svg
                  className="link-field__icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>

              <div className="link-field__link-details">
                <div className="link-field__link-title">
                  {linkData.title || 'Link'}
                </div>
                <a
                  href={linkData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-field__link-url"
                >
                  {linkData.url}
                </a>
                <div className="link-field__link-target">
                  Target: {linkData.target === '_blank' ? 'New window' : 'Same window'}
                </div>
              </div>
            </div>

            <div className="link-field__actions">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="link-field__button link-field__button--edit"
              >
                Edit Link
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="link-field__button link-field__button--remove"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="link-field__form">
            <div className="link-field__form-group">
              <label className="link-field__form-label">
                URL <span className="link-field__required">*</span>
              </label>
              <input
                type="url"
                value={linkData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder={fieldConfig.urlPlaceholder || 'https://example.com'}
                className="link-field__input"
              />
            </div>

            <div className="link-field__form-group">
              <label className="link-field__form-label">
                Link Text {fieldConfig.requireTitle && <span className="link-field__required">*</span>}
              </label>
              <input
                type="text"
                value={linkData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={fieldConfig.titlePlaceholder || 'Click here'}
                className="link-field__input"
              />
            </div>

            {fieldConfig.enableTarget !== false && (
              <div className="link-field__form-group">
                <label className="link-field__form-label">
                  Link Target
                </label>
                <select
                  value={linkData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  className="link-field__select"
                >
                  <option value="_self">Same window</option>
                  <option value="_blank">New window</option>
                </select>
              </div>
            )}

            <div className="link-field__actions">
              {linkData.url ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="link-field__button link-field__button--save"
                  >
                    Save Link
                  </button>
                  {!fieldConfig.required && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="link-field__button link-field__button--cancel"
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="link-field__button link-field__button--add"
                  disabled={!linkData.url}
                >
                  {fieldConfig.addButtonText || 'Add Link'}
                </button>
              )}
            </div>

            <p className="link-field__hint">
              Enter a URL to enable saving
            </p>
          </div>
        )}

        {!hasLink && !isEditing && (
          <div className="link-field__empty">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="link-field__button link-field__button--add"
            >
              {fieldConfig.addButtonText || 'Add Link'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="link-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const LinkFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="link-field__display link-field__display--empty">-</span>;
  }

  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    if (data && typeof data === 'object' && data.url) {
      return (
        <a
          href={data.url}
          target={data.target || '_self'}
          rel="noopener noreferrer"
          className="link-field__display link-field__display--link"
        >
          {data.title || data.url}
        </a>
      );
    }
  } catch (err) {
    console.error('Error parsing link value:', err);
  }

  return <span className="link-field__display link-field__display--empty">-</span>;
};

export const linkFieldDefinition = {
  type: 'link',
  Input: LinkFieldInput,
  Display: LinkFieldDisplay,
  defaultConfig: {
    enableTarget: true,
    requireTitle: false,
  },
};

export const useLinkField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'link',
  };
};

export default LinkFieldInput;
