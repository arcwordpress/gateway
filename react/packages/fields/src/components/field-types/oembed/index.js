import { useState, useEffect } from '@wordpress/element';
import './style.css';

const OEmbedFieldInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('OEmbedFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    helpText,
    default: defaultValue = '',
    placeholder = 'https://www.youtube.com/watch?v=...',
  } = config;

  const currentValue = watch(name);
  const [url, setUrl] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [embedError, setEmbedError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    register(name);
  }, [name, register]);

  useEffect(() => {
    if (setValue && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);

  useEffect(() => {
    if (currentValue && currentValue !== url) {
      setUrl(currentValue);
      fetchEmbed(currentValue);
    }
  }, [currentValue]);

  const fetchEmbed = async (embedUrl) => {
    if (!embedUrl) {
      setEmbedData(null);
      return;
    }

    setLoading(true);
    setEmbedError(null);

    try {
      const response = await fetch(
        `/wp-json/oembed/1.0/proxy?url=${encodeURIComponent(embedUrl)}`,
        {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmbedData(data);
        setIsEditing(false);
      } else {
        setEmbedError('Unable to fetch embed. Please check the URL.');
        setEmbedData(null);
      }
    } catch (err) {
      console.error('Error fetching embed:', err);
      setEmbedError('Failed to load embed preview.');
      setEmbedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      setValue(name, url);
      fetchEmbed(url);
    }
  };

  const handleClear = () => {
    setUrl('');
    setEmbedData(null);
    setEmbedError(null);
    setValue(name, '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEmbedError(null);
  };

  const hasEmbed = embedData && !isEditing;

  const containerClasses = ['oembed-field__container'];
  if (error) {
    containerClasses.push('oembed-field__container--error');
  }

  return (
    <div className="oembed-field">
      <label htmlFor={name} className="oembed-field__label">
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {required && <span className="oembed-field__required">*</span>}
      </label>

      {helpText && (
        <p className="oembed-field__help">{helpText}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {hasEmbed ? (
          <div className="oembed-field__preview">
            <div className="oembed-field__embed">
              {embedData.html && (
                <div
                  className="oembed-field__embed-container"
                  dangerouslySetInnerHTML={{ __html: embedData.html }}
                />
              )}
            </div>

            <div className="oembed-field__meta">
              {embedData.title && (
                <div className="oembed-field__title">
                  {embedData.title}
                </div>
              )}

              {embedData.author_name && (
                <div className="oembed-field__author">
                  by {embedData.author_name}
                </div>
              )}

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="oembed-field__url"
              >
                {url}
              </a>

              {embedData.provider_name && (
                <div className="oembed-field__provider">
                  <span className="oembed-field__provider-name">
                    {embedData.provider_name}
                  </span>
                  {embedData.width && embedData.height && (
                    <span className="oembed-field__dimensions">
                      {embedData.width} × {embedData.height}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="oembed-field__actions">
              <button
                type="button"
                onClick={handleEdit}
                className="oembed-field__button oembed-field__button--edit"
              >
                Change URL
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="oembed-field__button oembed-field__button--remove"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="oembed-field__form">
            <form onSubmit={handleSubmit} className="oembed-field__form-inner">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={placeholder}
                  className="oembed-field__input"
                  disabled={loading}
                />
              </div>

              {embedError && (
                <div className="oembed-field__error-message">
                  {embedError}
                </div>
              )}

              {loading && (
                <div className="oembed-field__loading">
                  Loading preview...
                </div>
              )}

              <div className="oembed-field__buttons">
                <button
                  type="submit"
                  disabled={!url || loading}
                  className="oembed-field__button oembed-field__button--submit"
                >
                  {loading ? 'Loading...' : (embedData ? 'Update' : 'Preview')}
                </button>
                {(url || embedData) && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="oembed-field__button oembed-field__button--clear"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="oembed-field__hint">
                Supports YouTube, Vimeo, Twitter, Instagram, Spotify, SoundCloud, and more
              </p>
            </form>
          </div>
        )}
      </div>

      {error && (
        <p className="oembed-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const OEmbedFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="oembed-field__display oembed-field__display--empty">-</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="oembed-field__display oembed-field__display--link"
    >
      {value}
    </a>
  );
};

export const oembedFieldDefinition = {
  type: 'oembed',
  Input: OEmbedFieldInput,
  Display: OEmbedFieldDisplay,
  defaultConfig: {},
};

export const useOEmbedField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'oembed',
  };
};

export default OEmbedFieldInput;
