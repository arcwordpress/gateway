import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import './style.css';

// Input Component (for forms)
const FileFieldTypeInput = ({ config = {} }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('FileFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultValue = '',
    allowedTypes = null,
    mediaTitle = 'Select File',
    mediaButtonText = 'Use this file',
    buttonText = 'Select File',
    description = 'Click to select a file from the media library',
  } = config;

  const currentValue = watch(name);
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);

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
      setFileId(currentValue);
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
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }

    const frameConfig = {
      title: mediaTitle,
      button: {
        text: mediaButtonText,
      },
      multiple: false,
    };

    if (allowedTypes) {
      frameConfig.library = {
        type: allowedTypes,
      };
    }

    const frame = window.wp.media(frameConfig);

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      setFileId(attachment.id);
      setValue(name, attachment.id, { shouldValidate: true });

      setFile({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename || attachment.title,
        filesize: attachment.filesizeInBytes,
        mime_type: attachment.mime,
      });
    });

    frame.open();
  };

  const removeFile = () => {
    setFileId(null);
    setFile(null);
    setValue(name, '', { shouldValidate: true });
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

  const containerClasses = ['file-field__container'];
  if (fieldError) {
    containerClasses.push('file-field__container--error');
  }

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="file-field">
      <label htmlFor={name} className="file-field__label">
        {labelText}
        {required && <span className="file-field__required">*</span>}
      </label>

      {help && (
        <p className="file-field__help">{help}</p>
      )}

      <div className={containerClasses.join(' ')}>
        {file ? (
          <div className="file-field__preview">
            <div className="file-field__file-info">
              <div className="file-field__file-icon">
                {getFileIcon(file.mime_type)}
              </div>

              <div className="file-field__file-details">
                <div className="file-field__file-name">
                  {file.filename}
                </div>
                <div className="file-field__file-meta">
                  {file.filesize && (
                    <span className="file-field__file-size">
                      {formatFileSize(file.filesize)}
                    </span>
                  )}
                  {file.mime_type && (
                    <span className="file-field__file-type">
                      {file.mime_type}
                    </span>
                  )}
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-field__file-link"
                >
                  View file →
                </a>
              </div>
            </div>

            <div className="file-field__actions">
              <button
                type="button"
                onClick={openMediaLibrary}
                className="file-field__button file-field__button--change"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="file-field__button file-field__button--remove"
              >
                Remove
              </button>
            </div>

            {fileId && (
              <div className="file-field__id">
                Attachment ID: {fileId}
              </div>
            )}
          </div>
        ) : (
          <div className="file-field__empty">
            <svg
              className="file-field__empty-icon"
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
            <div>
              <button
                type="button"
                onClick={openMediaLibrary}
                className="file-field__button file-field__button--select"
              >
                {buttonText}
              </button>
            </div>
            <p className="file-field__empty-description">
              {description}
            </p>
            {allowedTypes && (
              <p className="file-field__empty-types">
                Allowed types: {Array.isArray(allowedTypes)
                  ? allowedTypes.join(', ')
                  : allowedTypes}
              </p>
            )}
          </div>
        )}
      </div>

      {fieldError && (
        <p className="file-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

// Display Component (for grids and read-only views)
const FileFieldTypeDisplay = ({ value, config }) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (value) {
      fetchFileData(value);
    }
  }, [value]);

  const fetchFileData = async (attachmentId) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/media/${attachmentId}`);
      if (response.ok) {
        const media = await response.json();
        setFile({
          url: media.source_url,
          filename: media.title?.rendered || 'File',
        });
      }
    } catch (err) {
      console.error('Error fetching file:', err);
    }
  };

  if (value === null || value === undefined || value === '') {
    return <span className="file-field__display file-field__display--empty">-</span>;
  }

  if (!file) {
    return <span className="file-field__display">Loading...</span>;
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="file-field__display file-field__display--link"
    >
      {file.filename}
    </a>
  );
};

// Field Type Definition for registry
export const fileFieldType = {
  type: 'file',
  Input: FileFieldTypeInput,
  Display: FileFieldTypeDisplay,
  defaultConfig: {
    allowedTypes: null,
    mediaTitle: 'Select File',
    mediaButtonText: 'Use this file',
    buttonText: 'Select File',
    description: 'Click to select a file from the media library',
  },
};

// Hook for easy usage
export const useFileField = (config) => {
  return useMemo(() => ({
    Input: (props) => <FileFieldTypeInput {...props} config={config} />,
    Display: (props) => <FileFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
