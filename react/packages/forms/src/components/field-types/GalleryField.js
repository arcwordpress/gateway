import { useState, useEffect } from '@wordpress/element';

const GalleryField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  useEffect(() => {
    // Parse current value - expecting JSON array of attachment IDs
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
      // Fetch all images in parallel
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

    // Pre-select existing images
    frame.on('open', () => {
      const selection = frame.state().get('selection');
      const ids = images.map(img => img.id);

      ids.forEach(id => {
        const attachment = window.wp.media.attachment(id);
        attachment.fetch();
        selection.add(attachment);
      });
    });

    // Handle selection
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
    // Store as JSON array string
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

    // Remove from old position
    newImages.splice(draggedIndex, 1);

    // Insert at new position
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

  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="text-sm text-gray-500 mb-2">{fieldConfig.helpText}</p>
      )}

      <div className={`border-2 border-dashed rounded-md p-4 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        {images.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-move rounded-md overflow-hidden border-2 transition-opacity ${
                    draggedIndex === index
                      ? 'opacity-50 border-blue-500'
                      : 'opacity-100 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Drag handle indicator */}
                  <div className="absolute top-1 left-1 bg-black/50 text-white px-1.5 py-0.5 rounded text-xs">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                    </svg>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Remove image"
                  >
                    <svg
                      className="w-4 h-4"
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

                  {/* Order number */}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white px-2 py-0.5 rounded text-xs font-medium">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {images.length} {images.length === 1 ? 'image' : 'images'}
                {maxImages && ` (max ${maxImages})`}
              </div>
              <div className="flex gap-2">
                {canAddMore && (
                  <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
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
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              Drag and drop images to reorder
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <div className="mt-4">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                {fieldConfig.buttonText || 'Add Images'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {fieldConfig.description || 'Click to select images from the media library'}
            </p>
            {maxImages && (
              <p className="mt-1 text-xs text-gray-400">
                Maximum {maxImages} images
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default GalleryField;
