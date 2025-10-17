import { useState, useEffect } from '@wordpress/element';

const ImageField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  useEffect(() => {
    // If currentValue is set, it's the attachment ID
    if (currentValue) {
      setImageId(currentValue);
      // Fetch image URL from attachment ID
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

        // Get the appropriate size URL
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
    // Check if wp.media is available
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }

    // Create media frame
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

    // Handle selection
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      setImageId(attachment.id);
      setValue(fieldName, attachment.id);

      // Get appropriate size URL for preview
      const size = fieldConfig.imageSize || 'medium';
      if (attachment.sizes && attachment.sizes[size]) {
        setImageUrl(attachment.sizes[size].url);
      } else {
        setImageUrl(attachment.url);
      }
    });

    // Open the frame
    frame.open();
  };

  const removeImage = () => {
    setImageId(null);
    setImageUrl('');
    setValue(fieldName, '');
  };

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
        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Selected image"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: fieldConfig.previewHeight || '200px' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300"
              >
                Remove
              </button>
            </div>

            {imageId && (
              <div className="text-xs text-gray-500">
                Attachment ID: {imageId}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
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
            <div className="mt-2">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                {fieldConfig.buttonText || 'Select Image'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {fieldConfig.description || 'Click to select an image from the media library'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default ImageField;
