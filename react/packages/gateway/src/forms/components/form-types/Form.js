import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, createRecord, getRecord, updateRecord } from '../../services/api';
import { useFieldType } from '../../index';
import { generateZodSchema } from '../../utils/zodSchemaGenerator';
import { createGatewayFormContext } from '../../utils/gatewayFormContext';

// Import the shared context
import { GatewayFormContext, useGatewayForm } from '../../utils/gatewayFormContext';

/**
 * Resolve the base REST endpoint from a collection's routes array.
 * Prefers the 'create' route (same path as 'get_many'), falls back to 'get_many'.
 * Returns null when routes is missing or has no usable entry.
 */
function resolveBaseEndpoint(routes) {
  if (!Array.isArray(routes) || routes.length === 0) return null;
  const r = routes.find((r) => r.type === 'create') ?? routes.find((r) => r.type === 'get_many') ?? null;
  return r ? r.route : null;
}

// Memoized field renderer - now uses context instead of props
const FieldRenderer = React.memo(({ fieldConfig }) => {
  // Debug: log the field config before using it
  if (!fieldConfig.type) {
    console.error('[Form] Field config missing type:', fieldConfig);
  } else {
    // Optionally, log all field configs for extra debugging
  }
  let Input;
  try {
    ({ Input } = useFieldType(fieldConfig));
  } catch (e) {
    console.error('[Form] useFieldType error for field:', fieldConfig, e);
    throw e;
  }
  const { formState } = useGatewayForm();
  const error = formState.errors[fieldConfig.name];
  return <Input config={fieldConfig} error={error} />;
});

const Form = ({ collectionKey, recordId, apiAuth }) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // ID of a record auto-saved by a has_many field before the user hit the main submit.
  const [autoSavedId, setAutoSavedId] = useState(null);

  // Generate validation schema from collection data
  const validationSchema = useMemo(() => {
    if (!collection) return null;
    return generateZodSchema(collection);
  }, [collection]);

  const methods = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onSubmit',
  });

  const { reset } = methods;

  useEffect(() => {
    if (collectionKey) {
      loadCollection();
    }
  }, [collectionKey]);

  useEffect(() => {
    if (recordId && collection) {
      loadRecord();
    }
  }, [recordId, collection]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCollection(collectionKey, { auth: apiAuth });
      setCollection(response);
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Collection "${collectionKey}" not found`
        : err.message || 'Failed to load collection';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = resolveBaseEndpoint(collection.routes);
      if (!endpoint) {
        throw new Error('No endpoint available for this collection');
      }
      const response = await getRecord(endpoint, recordId, { auth: apiAuth });

      // Populate form with existing data
      if (response.data) {
        reset(response.data);
        setIsEditMode(true);
      }
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Record #${recordId} not found`
        : err.message || 'Failed to load record';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const endpoint = resolveBaseEndpoint(collection?.routes);
    if (!endpoint) {
      setError('No endpoint available for submission');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const effectiveId = recordId || autoSavedId;
      let response;
      if (isEditMode || effectiveId) {
        response = await updateRecord(endpoint, effectiveId, data, { auth: apiAuth });
        setSuccess('Record updated successfully!');
      } else {
        response = await createRecord(endpoint, data, { auth: apiAuth });
        setSuccess('Record created successfully!');
        reset(); // Clear form only on create
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save record');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Called by has_many fields when they need the parent ID before the main
  // submit button is pressed (inline child creation in create mode).
  // Validates, saves the parent, and returns the new record's ID.
  const saveParent = async () => {
    const endpoint = resolveBaseEndpoint(collection?.routes);
    if (!endpoint) throw new Error('No endpoint available');

    const effectiveId = recordId || autoSavedId;

    // Trigger validation; throws if invalid so the has_many field can handle it.
    const valid = await methods.trigger();
    if (!valid) throw new Error('Please fix validation errors before adding related items.');

    const data = methods.getValues();
    if (effectiveId) {
      // Already saved — update and return existing ID.
      await updateRecord(endpoint, effectiveId, data, { auth: apiAuth });
      return effectiveId;
    } else {
      const response = await createRecord(endpoint, data, { auth: apiAuth });
      const newId = response?.id ?? response?.data?.id ?? null;
      if (newId) {
        setAutoSavedId(newId);
        setIsEditMode(true);
      }
      return newId;
    }
  };

  // effectiveRecordId: use the prop if provided, otherwise fall back to a
  // record that was auto-saved by an inline has_many create action.
  const effectiveRecordId = recordId || autoSavedId || null;

  // Combined context value to provide to children (fields)
  const contextValue = useMemo(() => ({
    ...createGatewayFormContext(
      methods,
      collection,
      effectiveRecordId,
      loading,
      error,
      {}, // No fieldErrors for FormBuilder
      {}  // No updatingFields for FormBuilder
    ),
    saveParent,
  }), [methods, collection, effectiveRecordId, loading, error, autoSavedId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!collectionKey) {
    return (
      <div className="gty-form__container">
        <div className="gty-form__alert gty-form__alert--warning">
          No collection key provided. Add data-collection attribute.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="gty-form__container">Loading collection "{collectionKey}"...</div>;
  }

  if (error) {
    return (
      <div className="gty-form__container">
        <div className="gty-form__alert gty-form__alert--error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!collection || !collection.fields) {
    return (
      <div className="gty-form__container">
        <div className="gty-form__alert gty-form__alert--warning">
          Collection "{collectionKey}" loaded but has no fields.
        </div>
      </div>
    );
  }

  return (
    <GatewayFormContext.Provider value={contextValue}>
      <div className="gty-form__container">
        <div className="gty-form">
          {error && (
            <div className="gty-form__alert gty-form__alert--error">
              {error}
            </div>
          )}

          {success && (
            <div className="gty-form__alert gty-form__alert--success">
              {success}
            </div>
          )}

          <form onSubmit={methods.handleSubmit(onSubmit)} className="gty-form__fields">
            {methods.formState.isSubmitted && Object.keys(methods.formState.errors).length > 0 && (
              <div className="gty-form__validation-summary">
                <p className="gty-form__validation-summary-title">Please fix the following before continuing:</p>
                <ul className="gty-form__validation-summary-list">
                  {Object.entries(methods.formState.errors).map(([fieldName, err]) => {
                    const fieldDef = collection?.fields?.[fieldName];
                    const label = fieldDef?.label || fieldName;
                    return (
                      <li key={fieldName} className="gty-form__validation-summary-item">
                        <strong>{label}:</strong> {err?.message}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {Object.entries(collection.fields || {}).map(([fieldName, fieldDef]) => {
              // When fillable is present, honour it as a filter
              if (collection.fillable && Array.isArray(collection.fillable) && !collection.fillable.includes(fieldName)) {
                return null;
              }
              const fieldConfig = { name: fieldName, ...fieldDef };
              if (fieldConfig.hidden) return null;

              return (
                <FieldRenderer
                  key={fieldName}
                  fieldConfig={fieldConfig}
                />
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="gty-form__submit"
            >
              {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Record' : 'Create Record')}
            </button>
          </form>
        </div>
      </div>
    </GatewayFormContext.Provider>
  );
};

export { Form };
