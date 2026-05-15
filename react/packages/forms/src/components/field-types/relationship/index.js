import { useState, useEffect, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import './relationship-style.css';

/**
 * Resolve the target collection key for a given relationship name by scanning
 * the current collection's relationships array (provided via collection info).
 *
 * Returns null when the relationship or its target cannot be resolved.
 */
function resolveTargetKey(collection, relationshipName) {
  if (!collection || !relationshipName) return null;
  const rel = (collection.relationships || []).find((r) => r.name === relationshipName);
  return rel?.target_key ?? null;
}

const RelationshipControl = ({ config = {} }) => {
  const { register, formState, collection } = useGatewayForm();
  const name = config.name;

  if (!name) {
    console.warn('RelationshipField: No "name" provided in config');
    return null;
  }

  const fieldError = formState.errors[name];

  // Config keys are flat (no dot-notation) — set when saved via the Raptor
  // field editor or when defined directly in a PHP collection class.
  const relationshipName = config.relationship ?? '';
  const displayField     = config.displayField ?? 'title';
  const valueField       = config.valueField   ?? 'id';
  const placeholder      = config.placeholder  ?? 'Select an option...';

  const [options,    setOptions]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!relationshipName) {
      setFetchError('No relationship name configured');
      setLoading(false);
      return;
    }

    const targetKey = resolveTargetKey(collection, relationshipName);

    if (!targetKey) {
      setFetchError(`Relationship "${relationshipName}" not found in collection info`);
      setLoading(false);
      return;
    }

    const fetchOptions = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const client = getApiClient();

        // Fetch the target collection info to discover its route
        const infoRes       = await client.get(`gateway/v1/collections/${targetKey}`);
        const targetColl    = infoRes.data;
        const routesArr     = Array.isArray(targetColl?.routes) ? targetColl.routes : [];
        const getManyRoute  = routesArr.find((r) => r.type === 'get_many') ?? routesArr[0] ?? null;

        if (!getManyRoute) {
          throw new Error(`No route found for target collection "${targetKey}"`);
        }

        const endpoint  = `${getManyRoute.namespace}/${getManyRoute.path}`;
        const recordsRes = await client.get(endpoint);
        const items      = recordsRes.data?.data?.items ?? recordsRes.data;

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
 * When records are fetched with relations=true, the related object is embedded
 * in the record (e.g. record.docSet = { id: 2, title: "My Doc Set" }).
 * In that case `value` will be that object and we render the display field.
 * When relations are not loaded `value` is the raw FK — shown as-is.
 */
const RelationshipFieldTypeDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="relationship-field__display relationship-field__display--empty">-</span>;
  }

  const displayField = config?.displayField ?? 'title';

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
    displayField: 'title',
    valueField: 'id',
    placeholder: 'Select an option...',
  },
};

export const useRelationshipField = (config) => {
  return useMemo(() => ({
    Input: (props) => <RelationshipFieldTypeInput {...props} config={config} />,
    Display: (props) => <RelationshipFieldTypeDisplay {...props} config={config} />,
  }), [config]);
};
