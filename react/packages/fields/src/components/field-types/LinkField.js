import { useState, useEffect } from '@wordpress/element';

const LinkField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
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

  useEffect(() => {
    // Parse current value - expecting JSON object
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
    // Only save if URL is present
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
        {hasLink ? (
          // Display mode - show link info
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-5 h-5 text-blue-600"
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

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 mb-1">
                  {linkData.title || 'Link'}
                </div>
                <a
                  href={linkData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 break-all"
                >
                  {linkData.url}
                </a>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {linkData.target === '_blank' ? 'New window' : 'Same window'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
              >
                Edit Link
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Edit mode - show form
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={linkData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder={fieldConfig.urlPlaceholder || 'https://example.com'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Text {fieldConfig.requireTitle && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={linkData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={fieldConfig.titlePlaceholder || 'Click here'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {fieldConfig.enableTarget !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Target
                </label>
                <select
                  value={linkData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="_self">Same window</option>
                  <option value="_blank">New window</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              {linkData.url ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Save Link
                  </button>
                  {!fieldConfig.required && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  disabled={!linkData.url}
                >
                  {fieldConfig.addButtonText || 'Add Link'}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 italic">
              Enter a URL to enable saving
            </p>
          </div>
        )}

        {!hasLink && !isEditing && (
          <div className="p-4 text-center">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              {fieldConfig.addButtonText || 'Add Link'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default LinkField;
