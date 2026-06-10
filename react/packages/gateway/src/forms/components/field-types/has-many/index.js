import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import { GatewayFormContext, createGatewayFormContext } from '../../../utils/gatewayFormContext';
import { generateZodSchema } from '../../../utils/zodSchemaGenerator';
import { useFieldType } from '../../../fieldTypeRegistry';
import { createRecord } from '../../../services/api';
import Modal from '../../../../grids/components/Dialog';
import './has-many-style.css';

function resolveTargetKey(collection, relationshipName) {
  if (!collection || !relationshipName) return null;
  const rel = (collection.relationships || []).find((r) => r.name === relationshipName);
  return rel?.target_key ?? null;
}

function resolveEndpoint(routes, preferType) {
  if (!Array.isArray(routes) || routes.length === 0) return null;
  const r = routes.find((r) => r.type === preferType)
    ?? routes.find((r) => r.type === 'get_many')
    ?? routes[0]
    ?? null;
  return r ? `${r.namespace}/${r.path}` : null;
}

// ── Inline FieldRenderer ─────────────────────────────────────────────────────
// Mirrors the FieldRenderer in Form.js but lives inside the modal form context.

const InlineFieldRenderer = React.memo(({ fieldConfig }) => {
  const { Input } = useFieldType(fieldConfig);
  const { formState } = useGatewayForm();
  const error = formState.errors[fieldConfig.name];
  return <Input config={fieldConfig} error={error} />;
});

// ── HasManyInlineForm ────────────────────────────────────────────────────────
// Mini CRUD form rendered inside the modal for creating a related item.

const HasManyInlineForm = ({ targetCollection, onCreated, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validationSchema = useMemo(() => {
    if (!targetCollection) return null;
    return generateZodSchema(targetCollection);
  }, [targetCollection]);

  const methods = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onSubmit',
  });

  const endpoint = useMemo(() => resolveEndpoint(targetCollection?.routes, 'create'), [targetCollection]);

  const contextValue = useMemo(
    () => createGatewayFormContext(methods, targetCollection, null, false, submitError, {}, {}),
    [methods, targetCollection, submitError],
  );

  const onSubmit = async (data) => {
    if (!endpoint) {
      setSubmitError('No create endpoint available for this collection');
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      const newRecord = await createRecord(endpoint, data);
      onCreated(newRecord);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create record');
    } finally {
      setSubmitting(false);
    }
  };

  if (!targetCollection?.fields) {
    return <div className="has-many-modal__loading">Loading form...</div>;
  }

  return (
    <GatewayFormContext.Provider value={contextValue}>
      {submitError && (
        <div className="has-many-modal__error">{submitError}</div>
      )}
      <form onSubmit={methods.handleSubmit(onSubmit)} className="has-many-modal__form">
        {Object.entries(targetCollection.fields || {}).map(([fieldName, fieldDef]) => {
          if (fieldDef.hidden) return null;
          if (
            targetCollection.fillable &&
            Array.isArray(targetCollection.fillable) &&
            !targetCollection.fillable.includes(fieldName)
          ) {
            return null;
          }
          return (
            <InlineFieldRenderer key={fieldName} fieldConfig={{ name: fieldName, ...fieldDef }} />
          );
        })}
        <div className="has-many-modal__actions">
          <button
            type="button"
            className="has-many-modal__btn has-many-modal__btn--cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="has-many-modal__btn has-many-modal__btn--submit"
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create & Select'}
          </button>
        </div>
      </form>
    </GatewayFormContext.Provider>
  );
};

// ── HasManyControl ───────────────────────────────────────────────────────────

const HasManyControl = ({ config = {} }) => {
  const { setValue, getValues, collection } = useGatewayForm();
  const name          = config.name;
  const relName       = config.relationship ?? '';
  const displayField  = config.displayField ?? 'title';
  const valueField    = config.valueField   ?? 'id';

  // selectedIds is the primary source of truth; sync'd to RHF field value.
  const [selectedIds, setSelectedIds]     = useState([]);
  const [initialized, setInitialized]     = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [targetCollection, setTargetCollection] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);

  // Seed selectedIds from current form value once on mount.
  useEffect(() => {
    const current = getValues(name);
    if (Array.isArray(current) && current.length > 0) {
      setSelectedIds(current.map(String));
    }
    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep RHF in sync whenever selection changes (skip before initialization).
  useEffect(() => {
    if (!initialized) return;
    setValue(name, selectedIds, { shouldDirty: true, shouldValidate: false });
  }, [selectedIds, initialized, name, setValue]);

  // Fetch target collection info + its records.
  useEffect(() => {
    if (!relName) {
      setFetchError('No relationship name configured');
      setLoading(false);
      return;
    }

    const targetKey = resolveTargetKey(collection, relName);
    if (!targetKey) {
      setFetchError(`Relationship "${relName}" not found in collection info`);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const client = getApiClient();

        const infoRes  = await client.get(`gateway/v1/collections/${targetKey}`);
        const targetColl = infoRes.data;
        setTargetCollection(targetColl);

        const listEndpoint = resolveEndpoint(targetColl?.routes, 'get_many');
        if (listEndpoint) {
          const recordsRes = await client.get(listEndpoint);
          const items = recordsRes.data?.data?.items ?? recordsRes.data ?? [];
          setAvailableItems(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        setFetchError(err.message || 'Failed to load related items');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [relName, collection]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedItems = useMemo(
    () => availableItems.filter((item) => selectedIdSet.has(String(item[valueField]))),
    [availableItems, selectedIdSet, valueField],
  );

  const unselectedItems = useMemo(
    () => availableItems.filter((item) => !selectedIdSet.has(String(item[valueField]))),
    [availableItems, selectedIdSet, valueField],
  );

  const getLabel = (item) =>
    item[displayField] ?? item.title ?? item.name ?? String(item[valueField]);

  const handleSelect = useCallback((item) => {
    setSelectedIds((prev) => [...prev, String(item[valueField])]);
    setDropdownOpen(false);
  }, [valueField]);

  const handleRemove = useCallback((id) => {
    setSelectedIds((prev) => prev.filter((v) => v !== String(id)));
  }, []);

  const handleCreated = useCallback((newRecord) => {
    setAvailableItems((prev) => [...prev, newRecord]);
    setSelectedIds((prev) => [...prev, String(newRecord[valueField])]);
    setModalOpen(false);
  }, [valueField]);

  if (!name) return null;

  if (loading) return <div className="has-many__loading">Loading…</div>;
  if (fetchError) return <div className="has-many__error">Error: {fetchError}</div>;

  return (
    <div className="has-many">
      {/* ── Selected chips ── */}
      <div className="has-many__chips">
        {selectedItems.length === 0 ? (
          <span className="has-many__empty">No items selected</span>
        ) : (
          selectedItems.map((item) => (
            <span key={item[valueField]} className="has-many__chip">
              <span className="has-many__chip-label">{getLabel(item)}</span>
              <button
                type="button"
                className="has-many__chip-remove"
                onClick={() => handleRemove(item[valueField])}
                aria-label={`Remove ${getLabel(item)}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* ── Actions row ── */}
      <div className="has-many__actions">
        {/* Select existing */}
        {unselectedItems.length > 0 && (
          <div className="has-many__dropdown-wrap">
            <button
              type="button"
              className="has-many__btn has-many__btn--select"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              + Select Existing
            </button>
            {dropdownOpen && (
              <>
                <div className="has-many__dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                <div className="has-many__dropdown">
                  {unselectedItems.map((item) => (
                    <button
                      key={item[valueField]}
                      type="button"
                      className="has-many__dropdown-item"
                      onClick={() => handleSelect(item)}
                    >
                      {getLabel(item)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Create new */}
        {targetCollection && (
          <button
            type="button"
            className="has-many__btn has-many__btn--create"
            onClick={() => setModalOpen(true)}
          >
            + Create New
          </button>
        )}
      </div>

      {/* ── Inline create modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Create New ${targetCollection?.label ?? targetCollection?.key ?? ''}`}
      >
        <HasManyInlineForm
          targetCollection={targetCollection}
          onCreated={handleCreated}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// ── Field type wrappers ──────────────────────────────────────────────────────

const HasManyFieldTypeInput = ({ config = {} }) => (
  <Field config={config} fieldControl={<HasManyControl config={config} />} />
);

const HasManyFieldTypeDisplay = ({ value }) => {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="has-many__display--empty">—</span>;
  }
  return (
    <span className="has-many__display">
      {value.length} item{value.length !== 1 ? 's' : ''}
    </span>
  );
};

export const hasManyFieldType = {
  type: 'has_many',
  Input: HasManyFieldTypeInput,
  Display: HasManyFieldTypeDisplay,
  defaultConfig: {
    displayField: 'title',
    valueField: 'id',
  },
};

export const useHasManyField = (config) =>
  useMemo(
    () => ({
      Input:   (props) => <HasManyFieldTypeInput   {...props} config={config} />,
      Display: (props) => <HasManyFieldTypeDisplay {...props} config={config} />,
    }),
    [config],
  );
