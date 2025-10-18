import { useState, useEffect } from '@wordpress/element';

const FileField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  useEffect(() => {
    // If currentValue is set, it's the attachment ID
    if (currentValue) {
      setFileId(currentValue);
      // Fetch file data from attachment ID
      fetchFileData(currentValue);
    }
  }, [currentValue]);

  const fetchFileData = async (attachmentId) => {
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
        setFile({
          id: media.id,
          url: media.source_url,
          filename: media.title?.rendered || 'File',
          filesize: media.media_details?.filesize,
          mime_type: media.mime_type,
        });
      }
    } catch (err) {
      console.error('Error fetching file:', err);
    }
  };

  const openMediaLibrary = () => {
    // Check if wp.media is available
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }

    // Get allowed file types from config
    const allowedTypes = fieldConfig.allowedTypes || null;

    // Create media frame
    const frameConfig = {
      title: fieldConfig.mediaTitle || 'Select File',
      button: {
        text: fieldConfig.mediaButtonText || 'Use this file',
      },
      multiple: false,
    };

    // Add file type restrictions if specified
    if (allowedTypes) {
      frameConfig.library = {
        type: allowedTypes,
      };
    }

    const frame = window.wp.media(frameConfig);

    // Handle selection
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      setFileId(attachment.id);
      setValue(fieldName, attachment.id);

      setFile({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename || attachment.title,
        filesize: attachment.filesizeInBytes,
        mime_type: attachment.mime,
      });
    });

    // Open the frame
    frame.open();
  };

  const removeFile = () => {
    setFileId(null);
    setFile(null);
    setValue(fieldName, '');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📄';

    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';

    return '📄';
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
        {file ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-3xl flex-shrink-0">
                {getFileIcon(file.mime_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {file.filename}
                </div>
                <div className="flex gap-3 mt-1">
                  {file.filesize && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.filesize)}
                    </span>
                  )}
                  {file.mime_type && (
                    <span className="text-xs text-gray-500">
                      {file.mime_type}
                    </span>
                  )}
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                >
                  View file →
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300"
              >
                Remove
              </button>
            </div>

            {fileId && (
              <div className="text-xs text-gray-500">
                Attachment ID: {fileId}
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
                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
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
                {fieldConfig.buttonText || 'Select File'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {fieldConfig.description || 'Click to select a file from the media library'}
            </p>
            {fieldConfig.allowedTypes && (
              <p className="mt-1 text-xs text-gray-400">
                Allowed types: {Array.isArray(fieldConfig.allowedTypes)
                  ? fieldConfig.allowedTypes.join(', ')
                  : fieldConfig.allowedTypes}
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

export default FileField;
