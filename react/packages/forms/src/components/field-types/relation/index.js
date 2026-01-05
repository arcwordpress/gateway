import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import './relation-style.css';

const RelationControl = ({ config = {} }) => {

  const { register, formState } = useGatewayForm();
  const name = config.name;
  
  if (!name) {
    console.warn('RelationFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help = '',
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
        const client = getApiClient();
        const response = await client.get(endpoint);
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
    <div className="relation-field">
      {loading ? (
        <div className="relation-field__loading">
          Loading options...
        </div>
      ) : fetchError ? (
        <div className="relation-field__error-fetch">
          Error: {fetchError}
        </div>
      ) : (
        <select
          id={name}
          {...register(name)}
          className={`relation-field__select ${fieldError ? 'relation-field__select--error' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option[valueField]} value={option[valueField]}>
              {option[labelField]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

const RelationFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<RelationControl config={config} />} />
    );
};

const RelationFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="relation-field__display relation-field__display--empty">-</span>;
  }

  const labelField = config?.relation?.labelField || config?.labelField || 'title';

  if (typeof value === 'object' && value !== null) {
    const label = value[labelField] || value.name || value.title || value.label;
    return <span className="relation-field__display">{label || '-'}</span>;
  }

  return <span className="relation-field__display">{String(value)}</span>;
};

export const relationFieldType = {
  type: 'relation',
  Input: RelationFieldTypeInput,
  Display: RelationFieldTypeDisplay,
  defaultConfig: {
    relation: {
      labelField: 'title',
      valueField: 'id',
      placeholder: 'Select an option...',
    },
  },
};

export const useRelationField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RelationFieldTypeInput {...props} config={config} />,
    Display: (props) => <RelationFieldTypeDisplay {...props} config={config} />
  }), [config]);
};