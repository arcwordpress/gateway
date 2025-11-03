import { useState, useEffect, useMemo } from '@wordpress/element';
import axios from 'axios';

// Input Component (for forms)
const RelationFieldInput = ({ config = {}, error, register, ...inputProps }) => {
  const name = inputProps.name || config.name;
  if (!name) {
    console.warn('RelationFieldInput: No "name" provided in props or config');
    return null;
  }

  const {
    label,
    required,
    helpText,
    relation: relationConfig = {},
  } = config;

  const {
    endpoint,
    labelField = 'title',
    valueField = 'id',
    placeholder = 'Select an option...',
  } = relationConfig;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

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

        // Get nonce from gatewayAdminScript (primary) or wpApiSettings (fallback)
        const nonce = window.gatewayAdminScript?.nonce || window.wpApiSettings?.nonce || '';

        const response = await axios.get(endpoint, {
          headers: {
            'X-WP-Nonce': nonce,
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
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helpText && (
        <p className="text-sm text-gray-500 mb-2">{helpText}</p>
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
          id={name}
          {...register(name)}
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

// Display Component (for grids and read-only views)
export const RelationFieldDisplay = ({ value, config }) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">-</span>;
  }

  const labelField = config?.labelField || 'title';

  // If value is an object (the full related record), extract the label
  if (typeof value === 'object' && value !== null) {
    const label = value[labelField] || value.name || value.title || value.label;
    return <span>{label || '-'}</span>;
  }

  // If value is just an ID or string, return as-is
  return <span>{String(value)}</span>;
};

// Field Definition for registry
export const relationFieldDefinition = {
  type: 'relation',
  Input: RelationFieldInput,
  Display: RelationFieldDisplay,
  defaultConfig: {
    labelField: 'title',
    valueField: 'id',
    placeholder: 'Select an option...',
  },
};

// Hook for easy usage
export const useRelationField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RelationFieldInput {...props} config={config} />,
    Display: (props) => <RelationFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const RelationField = RelationFieldInput;
export default RelationField;
