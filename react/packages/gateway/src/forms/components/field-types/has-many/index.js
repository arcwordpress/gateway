import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import { GatewayFormContext, createGatewayFormContext } from '../../../utils/gatewayFormContext';
import { generateZodSchema } from '../../../utils/zodSchemaGenerator';
import { useFieldType } from '../../../fieldTypeRegistry';
import { createRecord, updateRecord } from '../../../services/api';
import Modal from '../../../../grids/components/Dialog';
import './has-many-style.css';

function resolveTargetKey(collection, relationshipName) {
  if (!collection || !relationshipName) return null;
  const rel = (collection.relationships || []).find((r) => r.name === relationshipName);
  return rel?.target_key ?? null;
}

function resolveEndpoint(routes, preferType) {
  if (!Array.isArray(routes) || routes.length === 0) return null;
  const r =
    routes.find((r) => r.type === preferType) ??
    routes.find((r) => r.type === 'get_many') ??
    routes[0] ??
    null;
  if (!r) return null;
  // WordPress REST routes for single-item operations include a regex placeholder
  // like "(?P<id>\d+)".  Strip everything from that pattern onward so we end up
  // with a clean base path (e.g. "timeline-images") that we can append the ID to.
  const cleanPath = (r.path ?? '').replace(/\/\(\?P<[^>]+>[^)]+\).*$/, '');
  return `${r.namespace}/${cleanPath}`;
}

// ── Inline FieldRenderer ─────────────────────────────────────────────────────

const InlineFieldRenderer = React.memo(({ fieldConfig }) => {
  const { Input } = useFieldType(fieldConfig);
  const { formState } = useGatewayForm();
  const error = formState.errors[fieldConfig.name];
  return <Input config={fieldConfig} error={error} />;
});

// ── HasManyInlineForm ────────────────────────────────────────────────────────
// Mini form for creating a child record. The FK field is pre-filled with the
// parent ID and hidden so the user never sees or touches it.

const HasManyInlineForm = ({ targetCollection, fkField, parentId, onCreated, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const defaultValues = useMemo(() => {
    if (fkField && parentId != null) return { [fkField]: parentId };
    return {};
  }, [fkField, parentId]);

  const validationSchema = useMemo(
    () => (targetCollection ? generateZodSchema(targetCollection) : null),
    [targetCollection],
  );

  const methods = useForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onSubmit',
  });

  const endpoint = useMemo(
    () => resolveEndpoint(targetCollection?.routes, 'create'),
    [targetCollection],
  );

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
    return <div className="has-many-modal__loading">Loading form…</div>;
  }

  return (
    <GatewayFormContext.Provider value={contextValue}>
      {submitError && <div className="has-many-modal__error">{submitError}</div>}
      <form onSubmit={methods.handleSubmit(onSubmit)} className="has-many-modal__form">
        {Object.entries(targetCollection.fields || {}).map(([fieldName, fieldDef]) => {
          // Always skip the FK field — it's pre-filled and not for the user to edit.
          if (fieldName === fkField) return null;
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
  const { collection, recordId, unregister, saveParent } = useGatewayForm();

  const name         = config.name;
  const relName      = config.relationship ?? '';
  const displayField = config.displayField ?? 'title';
  const valueField   = config.valueField   ?? 'id';
  const fkField      = config.fkField ?? null;

  // Ensure any array value seeded into RHF by reset(serverData) is removed
  // so it never interferes with parent form validation.
  useEffect(() => {
    if (name && unregister) {
      unregister(name, { keepDefaultValue: false, keepValue: false });
    }
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const [allItems, setAllItems]                 = useState([]);
  const [targetCollection, setTargetCollection] = useState(null);
  const [updateEndpoint, setUpdateEndpoint]     = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [fetchError, setFetchError]             = useState(null);
  const [actionError, setActionError]           = useState(null);
  const [modalOpen, setModalOpen]               = useState(false);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [autoSaving, setAutoSaving]             = useState(false);

  // parentId comes from context — updated immediately after auto-save.
  const parentId = recordId ?? null;

  // Fetch target collection info + all its records.
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

        const infoRes    = await client.get(`gateway/v1/collections/${targetKey}`);
        const targetColl = infoRes.data;
        setTargetCollection(targetColl);

        const listEndpoint = resolveEndpoint(targetColl?.routes, 'get_many');
        if (listEndpoint) {
          const recordsRes = await client.get(listEndpoint);
          const items = recordsRes.data?.data?.items ?? recordsRes.data ?? [];
          setAllItems(Array.isArray(items) ? items : []);
        }

        setUpdateEndpoint(resolveEndpoint(targetColl?.routes, 'update'));
      } catch (err) {
        setFetchError(err.message || 'Failed to load related items');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [relName, collection]);

  // Items currently associated with this parent (FK matches parentId).
  const currentItems = useMemo(() => {
    if (!fkField || parentId == null) return [];
    return allItems.filter((item) => String(item[fkField]) === String(parentId));
  }, [allItems, fkField, parentId]);

  // Items that can be re-assigned to this parent.
  const availableItems = useMemo(() => {
    if (!fkField || parentId == null) return [];
    return allItems.filter((item) => String(item[fkField]) !== String(parentId));
  }, [allItems, fkField, parentId]);

  const getLabel = (item) =>
    item[displayField] ?? item.title ?? item.name ?? String(item[valueField]);

  // Ensure the parent record exists (auto-save if needed) before any child operation.
  const ensureParent = async () => {
    if (parentId != null) return parentId;
    if (!saveParent) throw new Error('Auto-save not available');
    setAutoSaving(true);
    try {
      const newId = await saveParent();
      return newId;
    } finally {
      setAutoSaving(false);
    }
  };

  // "Create New" — auto-save parent first if needed, then open modal.
  const handleCreateNew = async () => {
    setActionError(null);
    try {
      await ensureParent();
      setModalOpen(true);
    } catch (err) {
      setActionError(err.message || 'Could not save parent record');
    }
  };

  // "Select existing" — auto-save parent if needed, then re-assign FK.
  const handleSelect = async (item) => {
    if (!fkField) return;
    setActionError(null);
    setDropdownOpen(false);
    try {
      const pid = await ensureParent();
      const updated = await updateRecord(updateEndpoint, item[valueField], { [fkField]: pid });
      setAllItems((prev) =>
        prev.map((i) => (String(i[valueField]) === String(item[valueField]) ? { ...i, ...updated } : i)),
      );
    } catch (err) {
      setActionError(err.message || 'Failed to associate item');
      console.error('HasMany: failed to associate item', err);
    }
  };

  // "Remove" — set child FK to null.
  const handleRemove = async (item) => {
    if (!updateEndpoint || !fkField) return;
    try {
      const updated = await updateRecord(updateEndpoint, item[valueField], { [fkField]: null });
      setAllItems((prev) =>
        prev.map((i) => (String(i[valueField]) === String(item[valueField]) ? { ...i, ...updated } : i)),
      );
    } catch (err) {
      console.error('HasMany: failed to disassociate item', err);
    }
  };

  const handleCreated = (newRecord) => {
    setAllItems((prev) => [...prev, newRecord]);
    setModalOpen(false);
  };

  if (!name) return null;
  if (loading) return <div className="has-many__loading">Loading…</div>;
  if (fetchError) return <div className="has-many__error">Error: {fetchError}</div>;

  return (
    <div className="has-many">
      {actionError && <div className="has-many__error">{actionError}</div>}

      {/* ── Current associated items ── */}
      <div className="has-many__chips">
        {currentItems.length === 0 ? (
          <span className="has-many__empty">No items associated yet</span>
        ) : (
          currentItems.map((item) => (
            <span key={item[valueField]} className="has-many__chip">
              <span className="has-many__chip-label">{getLabel(item)}</span>
              {fkField && (
                <button
                  type="button"
                  className="has-many__chip-remove"
                  onClick={() => handleRemove(item)}
                  aria-label={`Remove ${getLabel(item)}`}
                >
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>

      <div className="has-many__actions">
        {/* Select existing (re-assign FK) */}
        {fkField && availableItems.length > 0 && (
          <div className="has-many__dropdown-wrap">
            <button
              type="button"
              className="has-many__btn has-many__btn--select"
              disabled={autoSaving}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              + Select Existing
            </button>
            {dropdownOpen && (
              <>
                <div
                  className="has-many__dropdown-backdrop"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="has-many__dropdown">
                  {availableItems.map((item) => (
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
            disabled={autoSaving}
            onClick={handleCreateNew}
          >
            {autoSaving ? 'Saving…' : '+ Create New'}
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
          fkField={fkField}
          parentId={parentId}
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
