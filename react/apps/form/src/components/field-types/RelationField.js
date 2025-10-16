import { useState, useEffect } from '@wordpress/element';
import axios from 'axios';

const RelationField = ({ fieldName, fieldConfig, register, error }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const relationConfig = fieldConfig.relation || {};
  const {
    endpoint,
    labelField = 'title',
    valueField = 'id',
    placeholder = 'Select an option...',
  } = relationConfig;

  useEffect(() => {
    if (!endpoint) {
      setFetchError('No endpoint configured for relation field');
      setLoading(false);
      return;
    }

    const fetchOptions = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const response = await axios.get(endpoint, {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        });

        // Data is always at data.items for collection routes
        const data = response.data.data.items;

        if (!Array.isArray(data)) {
          throw new Error('API response items is not an array');
        }

        setOptions(data);
      } catch (err) {
        console.error('Failed to fetch relation options:', err);
        setFetchError(err.message || 'Failed to load options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [endpoint]);

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

      {loading ? (
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading options...
        </div>
      ) : fetchError ? (
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600">
          Error: {fetchError}
        </div>
      ) : (
        <select
          id={fieldName}
          {...register(fieldName)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option[valueField]} value={option[valueField]}>
              {option[labelField]}
            </option>
          ))}
        </select>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default RelationField;
