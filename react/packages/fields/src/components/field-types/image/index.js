import { useState, useEffect } from '@wordpress/element';
import './style.css';

const ImageFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState(null);

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
      setImageId(currentValue);
      fetchImageUrl(currentValue);
    }
  }, [currentValue]);

  const fetchImageUrl = async (attachmentId) => {
    try {
      const response = await fetch(
        `/wp-json/wp/v2/media/${attachmentId}`,
        {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

      if (response.ok) {
        const media = await response.json();
        const size = fieldConfig.imageSize || 'medium';

        if (media.media_details?.sizes?.[size]?.source_url) {
          setImageUrl(media.media_details.sizes[size].source_url);
        } else {
          setImageUrl(media.source_url);
        }
      }
    } catch (err) {
      console.error('Error fetching image:', err);
    }
  };

  const openMediaLibrary = () => {
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }

    const frame = window.wp.media({
      title: fieldConfig.mediaTitle || 'Select Image',
      button: {
        text: fieldConfig.mediaButtonText || 'Use this image',
      },
      multiple: false,
      library: {
        type: 'image',
      },
    });

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      setImageId(attachment.id);
      setValue(fieldName, attachment.id);

      const size = fieldConfig.imageSize || 'medium';
      if (attachment.sizes && attachment.sizes[size]) {
        setImageUrl(attachment.sizes[size].url);
      } else {
        setImageUrl(attachment.url);
      }
    });

    frame.open();
  };

  const removeImage = () => {
    setImageId(null);
    setImageUrl('');
    setValue(fieldName, '');
  };

  const containerClasses = ['image-field__container'];
  if (error) {
    containerClasses.push('image-field__container--error');
  }

  return (
    <div className="image-field">
      <label htmlFor={fieldName} className="image-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="image-field__required">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="image-field__help">{fieldConfig.helpText}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {imageUrl ? (
          <div className="image-field__preview">
            <div className="image-field__image-wrapper">
              <img
                src={imageUrl}
                alt="Selected image"
                className="image-field__image"
                style={{ maxHeight: fieldConfig.previewHeight || '200px' }}
              />
            </div>

            <div className="image-field__actions">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="image-field__button image-field__button--change"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="image-field__button image-field__button--remove"
              >
                Remove
              </button>
            </div>

            {imageId && (
              <div className="image-field__id">
                Attachment ID: {imageId}
              </div>
            )}
          </div>
        ) : (
          <div className="image-field__empty">
            <svg
              className="image-field__empty-icon"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <button
                type="button"
                onClick={openMediaLibrary}
                className="image-field__button image-field__button--select"
              >
                {fieldConfig.buttonText || 'Select Image'}
              </button>
            </div>
            <p className="image-field__empty-description">
              {fieldConfig.description || 'Click to select an image from the media library'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="image-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const ImageFieldDisplay = ({ value, config }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (value) {
      fetchImageUrl(value);
    }
  }, [value]);

  const fetchImageUrl = async (attachmentId) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/media/${attachmentId}`);
      if (response.ok) {
        const media = await response.json();
        const size = 'thumbnail';
        if (media.media_details?.sizes?.[size]?.source_url) {
          setImageUrl(media.media_details.sizes[size].source_url);
        } else {
          setImageUrl(media.source_url);
        }
      }
    } catch (err) {
      console.error('Error fetching image:', err);
    }
  };

  if (value === null || value === undefined || value === '') {
    return <span className="image-field__display image-field__display--empty">-</span>;
  }

  if (!imageUrl) {
    return <span className="image-field__display">Loading...</span>;
  }

  return (
    <img
      src={imageUrl}
      alt="Image"
      className="image-field__display-image"
    />
  );
};

export const imageFieldDefinition = {
  type: 'image',
  Input: ImageFieldInput,
  Display: ImageFieldDisplay,
  defaultConfig: {
    imageSize: 'medium',
    previewHeight: '200px',
  },
};

export const useImageField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'image',
  };
};

export default ImageFieldInput;
