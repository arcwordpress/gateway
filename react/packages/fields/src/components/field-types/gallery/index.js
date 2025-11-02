import { useState, useEffect } from '@wordpress/element';
import './style.css';

const GalleryFieldInput = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

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
        const ids = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
        if (Array.isArray(ids) && ids.length > 0) {
          fetchImages(ids);
        }
      } catch (err) {
        console.error('Error parsing gallery value:', err);
      }
    }
  }, [currentValue]);

  const fetchImages = async (attachmentIds) => {
    try {
      const promises = attachmentIds.map(id =>
        fetch(`/wp-json/wp/v2/media/${id}`, {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        })
      );

      const responses = await Promise.all(promises);
      const mediaData = await Promise.all(
        responses.map(async (res) => {
          if (res.ok) {
            return await res.json();
          }
          return null;
        })
      );

      const size = fieldConfig.thumbnailSize || 'thumbnail';
      const imageList = mediaData
        .filter(media => media !== null)
        .map(media => ({
          id: media.id,
          url: media.media_details?.sizes?.[size]?.source_url || media.source_url,
          fullUrl: media.source_url,
          alt: media.alt_text || '',
          title: media.title?.rendered || '',
        }));

      setImages(imageList);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  const openMediaLibrary = () => {
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }

    const frame = window.wp.media({
      title: fieldConfig.mediaTitle || 'Select Images',
      button: {
        text: fieldConfig.mediaButtonText || 'Add to gallery',
      },
      multiple: true,
      library: {
        type: 'image',
      },
    });

    frame.on('open', () => {
      const selection = frame.state().get('selection');
      const ids = images.map(img => img.id);

      ids.forEach(id => {
        const attachment = window.wp.media.attachment(id);
        attachment.fetch();
        selection.add(attachment);
      });
    });

    frame.on('select', () => {
      const attachments = frame.state().get('selection').toJSON();
      const size = fieldConfig.thumbnailSize || 'thumbnail';

      const newImages = attachments.map(attachment => ({
        id: attachment.id,
        url: attachment.sizes?.[size]?.url || attachment.url,
        fullUrl: attachment.url,
        alt: attachment.alt || '',
        title: attachment.title || '',
      }));

      setImages(newImages);
      updateFormValue(newImages);
    });

    frame.open();
  };

  const updateFormValue = (imageList) => {
    const ids = imageList.map(img => img.id);
    setValue(fieldName, JSON.stringify(ids));
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    updateFormValue(newImages);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
    updateFormValue(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const maxImages = fieldConfig.maxImages || null;
  const canAddMore = !maxImages || images.length < maxImages;

  const containerClasses = ['gallery-field__container'];
  if (error) {
    containerClasses.push('gallery-field__container--error');
  }

  return (
    <div className="gallery-field">
      <label htmlFor={fieldName} className="gallery-field__label">
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="gallery-field__required">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="gallery-field__help">{fieldConfig.helpText}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {images.length > 0 ? (
          <div className="gallery-field__preview">
            <div className="gallery-field__grid">
              {images.map((image, index) => {
                const itemClasses = ['gallery-field__item'];
                if (draggedIndex === index) {
                  itemClasses.push('gallery-field__item--dragging');
                }

                return (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={itemClasses.join(' ')}
                  >
                    <div className="gallery-field__image-wrapper">
                      <img
                        src={image.url}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        className="gallery-field__image"
                      />
                    </div>

                    <div className="gallery-field__drag-handle">
                      <svg
                        className="gallery-field__drag-icon"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="gallery-field__remove"
                      title="Remove image"
                    >
                      <svg
                        className="gallery-field__remove-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="gallery-field__order">
                      #{index + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="gallery-field__footer">
              <div className="gallery-field__count">
                {images.length} {images.length === 1 ? 'image' : 'images'}
                {maxImages && ` (max ${maxImages})`}
              </div>
              <div className="gallery-field__actions">
                {canAddMore && (
                  <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="gallery-field__button gallery-field__button--edit"
                  >
                    {images.length > 0 ? 'Edit Gallery' : 'Add Images'}
                  </button>
                )}
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setImages([]);
                      setValue(fieldName, '');
                    }}
                    className="gallery-field__button gallery-field__button--clear"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <p className="gallery-field__hint">
              Drag and drop images to reorder
            </p>
          </div>
        ) : (
          <div className="gallery-field__empty">
            <svg
              className="gallery-field__empty-icon"
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
                className="gallery-field__button gallery-field__button--add"
              >
                {fieldConfig.buttonText || 'Add Images'}
              </button>
            </div>
            <p className="gallery-field__empty-description">
              {fieldConfig.description || 'Click to select images from the media library'}
            </p>
            {maxImages && (
              <p className="gallery-field__empty-max">
                Maximum {maxImages} images
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="gallery-field__error">{error.message}</p>
      )}
    </div>
  );
};

export const GalleryFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="gallery-field__display gallery-field__display--empty">-</span>;
  }

  try {
    const ids = typeof value === 'string' ? JSON.parse(value) : value;
    if (Array.isArray(ids) && ids.length > 0) {
      return (
        <span className="gallery-field__display">
          {ids.length} {ids.length === 1 ? 'image' : 'images'}
        </span>
      );
    }
  } catch (err) {
    console.error('Error parsing gallery value:', err);
  }

  return <span className="gallery-field__display gallery-field__display--empty">-</span>;
};

export const galleryFieldDefinition = {
  type: 'gallery',
  Input: GalleryFieldInput,
  Display: GalleryFieldDisplay,
  defaultConfig: {
    maxImages: null,
    thumbnailSize: 'thumbnail',
  },
};

export const useGalleryField = (fieldName) => {
  return {
    fieldName,
    fieldType: 'gallery',
  };
};

export default GalleryFieldInput;
