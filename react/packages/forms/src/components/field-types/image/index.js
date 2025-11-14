import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

// Input Component (for forms)
const ImageFieldTypeInput = ({ config = {} }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('ImageFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultValue = '',
    imageSize = 'medium',
    previewHeight = '200px',
    mediaTitle = 'Select Image',
    mediaButtonText = 'Use this image',
    buttonText = 'Select Image',
    description = 'Click to select an image from the media library',
  } = config;

  const currentValue = watch(name);
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    register(name);
  }, [name, register]);

  // Initialize value on mount
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
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

        if (media.media_details?.sizes?.[imageSize]?.source_url) {
          setImageUrl(media.media_details.sizes[imageSize].source_url);
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
      title: mediaTitle,
      button: {
        text: mediaButtonText,
      },
      multiple: false,
      library: {
        type: 'image',
      },
    });

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      setImageId(attachment.id);
      setValue(name, attachment.id, { shouldValidate: true });

      if (attachment.sizes && attachment.sizes[imageSize]) {
        setImageUrl(attachment.sizes[imageSize].url);
      } else {
        setImageUrl(attachment.url);
      }
    });

    frame.open();
  };

  const removeImage = () => {
    setImageId(null);
    setImageUrl('');
    setValue(name, '', { shouldValidate: true });
  };

  const containerClasses = ['image-field__container'];
  if (fieldError) {
    containerClasses.push('image-field__container--error');
  }

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="image-field">
      <label htmlFor={name} className="image-field__label">
        {labelText}
        {required && <span className="image-field__required">*</span>}
      </label>

      {help && (
        <p className="image-field__help">{help}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {imageUrl ? (
          <div className="image-field__preview">
            <div className="image-field__image-wrapper">
              <img
                src={imageUrl}
                alt="Selected image"
                className="image-field__image"
                style={{ maxHeight: previewHeight }}
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
                {buttonText}
              </button>
            </div>
            <p className="image-field__empty-description">
              {description}
            </p>
          </div>
        )}
      </div>

      {fieldError && (
        <p className="image-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const ImageFieldTypeDisplay = ({ value, config }) => {
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

// Field Type Definition for registry
export const imageFieldType = {
  type: 'image',
  Input: ImageFieldTypeInput,
  Display: ImageFieldTypeDisplay,
  defaultConfig: {
    imageSize: 'medium',
    previewHeight: '200px',
    mediaTitle: 'Select Image',
    mediaButtonText: 'Use this image',
    buttonText: 'Select Image',
    description: 'Click to select an image from the media library',
  },
};

// Hook for easy usage
export const useImageField = (config) => {
  return useMemo(() => ({
    Input: (props) => <ImageFieldTypeInput {...props} config={config} />,
    Display: (props) => <ImageFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
