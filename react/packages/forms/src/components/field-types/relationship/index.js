import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import './relationship-style.css';

/**
 * Resolve the target collection's records endpoint from the current collection's
 * relationships array and the named relationship.
 *
 * Returns null when the relationship or its route cannot be resolved.
 */
function resolveTargetEndpoint(collection, relationshipName) {
  if (!collection || !relationshipName) return null;

  // Find matching relationship in the collection's relationships array
  const rel = (collection.relationships || []).find((r) => r.name === relationshipName);
  if (!rel?.target_key) return null;

  // Find the target collection route from the registered routes on the target
  // The target_key gives us the collection key; we look it up via the collections API.
  return { targetKey: rel.target_key };
}

const RelationshipControl = ({ config = {} }) => {
  const { register, formState, collection } = useGatewayForm();
  const name = config.name;

  if (!name) {
    console.warn('RelationshipField: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    relationship: relConfig = {},
  } = config;

  const {
    name: relationshipName,
    displayField = 'title',
    valueField = 'id',
    placeholder = 'Select an option...',
  } = relConfig;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!relationshipName) {
      setFetchError('No relationship name configured');
      setLoading(false);
      return;
    }

    const resolution = resolveTargetEndpoint(collection, relationshipName);

    if (!resolution) {
      setFetchError(`Relationship "${relationshipName}" not found in collection info`);
      setLoading(false);
      return;
    }

    const fetchOptions = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const client = getApiClient();

        // Fetch the target collection info to get its route
        const infoRes = await client.get(`gateway/v1/collections/${resolution.targetKey}`);
        const targetCollection = infoRes.data;
        const routesArr = Array.isArray(targetCollection?.routes) ? targetCollection.routes : [];
        const getManyRoute = routesArr.find((r) => r.type === 'get_many') ?? routesArr[0] ?? null;

        if (!getManyRoute) {
          throw new Error(`No route found for target collection "${resolution.targetKey}"`);
        }

        const endpoint = `${getManyRoute.namespace}/${getManyRoute.path}`;
        const recordsRes = await client.get(endpoint);
        const items = recordsRes.data?.data?.items ?? recordsRes.data;

        if (!Array.isArray(items)) {
          throw new Error('Unexpected response shape from target collection');
        }

        setOptions(items);
      } catch (err) {
        console.error('RelationshipField: failed to fetch options', err);
        setFetchError(err.message || 'Failed to load options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [relationshipName, collection]);

  return (
    <div className="relationship-field">
      {loading ? (
        <div className="relationship-field__loading">Loading options...</div>
      ) : fetchError ? (
        <div className="relationship-field__error-fetch">Error: {fetchError}</div>
      ) : (
        <select
          id={name}
          {...register(name)}
          className={`relationship-field__select ${fieldError ? 'relationship-field__select--error' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option[valueField]} value={option[valueField]}>
              {option[displayField] ?? option.title ?? option.name ?? option[valueField]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

const RelationshipFieldTypeInput = ({ config = {} }) => (
  <Field config={config} fieldControl={<RelationshipControl config={config} />} />
);

/**
 * Display a relationship value.
 *
 * When records are fetched with relations=true the related object is embedded
 * in the record (e.g. record.docSet = { id: 2, title: "My Doc Set" }).
 * In that case `value` will be that object and we can show the display field.
 * When relations are not loaded `value` is just the raw FK and we show it as-is.
 */
const RelationshipFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="relationship-field__display relationship-field__display--empty">-</span>;
  }

  const displayField = config?.relationship?.displayField || config?.displayField || 'title';

  if (typeof value === 'object' && value !== null) {
    const label = value[displayField] ?? value.title ?? value.name ?? value.label;
    return <span className="relationship-field__display">{label ?? '-'}</span>;
  }

  return <span className="relationship-field__display">{String(value)}</span>;
};

export const relationshipFieldType = {
  type: 'relationship',
  Input: RelationshipFieldTypeInput,
  Display: RelationshipFieldTypeDisplay,
  defaultConfig: {
    relationship: {
      displayField: 'title',
      valueField: 'id',
      placeholder: 'Select an option...',
    },
  },
};

export const useRelationshipField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RelationshipFieldTypeInput {...props} config={config} />,
    Display: (props) => <RelationshipFieldTypeDisplay {...props} config={config} />,
  }), [config]);
};
