import { useState, useEffect } from '@wordpress/element';

const OEmbedField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [url, setUrl] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [embedError, setEmbedError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

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
      // Use WordPress oEmbed endpoint
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
      setValue(fieldName, url);
      fetchEmbed(url);
    }
  };

  const handleClear = () => {
    setUrl('');
    setEmbedData(null);
    setEmbedError(null);
    setValue(fieldName, '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEmbedError(null);
  };

  const hasEmbed = embedData && !isEditing;

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

      <div className={`border rounded-md ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        {hasEmbed ? (
          // Display mode with embed preview
          <div className="p-4 space-y-3">
            <div className="relative bg-black rounded-md overflow-hidden">
              {embedData.html && (
                <div
                  className="oembed-container"
                  dangerouslySetInnerHTML={{ __html: embedData.html }}
                />
              )}
            </div>

            <div className="space-y-2">
              {embedData.title && (
                <div className="font-medium text-gray-900">
                  {embedData.title}
                </div>
              )}

              {embedData.author_name && (
                <div className="text-sm text-gray-600">
                  by {embedData.author_name}
                </div>
              )}

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 break-all inline-block"
              >
                {url}
              </a>

              {embedData.provider_name && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {embedData.provider_name}
                  </span>
                  {embedData.width && embedData.height && (
                    <span>
                      {embedData.width} × {embedData.height}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleEdit}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
              >
                Change URL
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Edit mode with URL input
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={fieldConfig.placeholder || 'https://www.youtube.com/watch?v=...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {embedError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {embedError}
                </div>
              )}

              {loading && (
                <div className="text-sm text-gray-600">
                  Loading preview...
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!url || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : (embedData ? 'Update' : 'Preview')}
                </button>
                {(url || embedData) && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Supports YouTube, Vimeo, Twitter, Instagram, Spotify, SoundCloud, and more
              </p>
            </form>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}

      <style>{`
        .oembed-container iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
        }
        .oembed-container blockquote {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default OEmbedField;
