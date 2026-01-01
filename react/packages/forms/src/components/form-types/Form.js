import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, createRecord, getRecord, updateRecord } from '../../services/api';
import { useFieldType } from '../../index';
import { generateZodSchema } from '../../utils/zodSchemaGenerator';
import { createGatewayFormContext } from '../../utils/gatewayFormContext';

// Import the shared context
import { GatewayFormContext, useGatewayForm } from '../../utils/gatewayFormContext';

// Memoized field renderer - now uses context instead of props
const FieldRenderer = React.memo(({ fieldConfig }) => {
  // Debug: log the field config before using it
  if (!fieldConfig.type) {
    console.error('[Form] Field config missing type:', fieldConfig);
  } else {
    // Optionally, log all field configs for extra debugging
    // console.log('[Form] Rendering field:', fieldConfig.name, 'type:', fieldConfig.type);
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
      console.log('Collection response:', response);
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
      const endpoint = collection.routes?.endpoint;
      if (!endpoint) {
        throw new Error('No endpoint available for this collection');
      }
      const response = await getRecord(endpoint, recordId, { auth: apiAuth });
      console.log('Record loaded:', response);

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
    const endpoint = collection?.routes?.endpoint;
    if (!endpoint) {
      setError('No endpoint available for submission');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      let response;
      if (isEditMode && recordId) {
        response = await updateRecord(endpoint, recordId, data, { auth: apiAuth });
        setSuccess('Record updated successfully!');
      } else {
        response = await createRecord(endpoint, data, { auth: apiAuth });
        setSuccess('Record created successfully!');
        reset(); // Clear form only on create
      }

      console.log('Save response:', response);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save record');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Combined context value to provide to children (fields)
  const contextValue = useMemo(() => createGatewayFormContext(
    methods,
    collection,
    recordId,
    loading,
    error,
    {}, // No fieldErrors for FormBuilder
    {}  // No updatingFields for FormBuilder
  ), [methods, collection, recordId, loading, error]);

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

  if (!collection || !collection.fillable) {
    return (
      <div className="gty-form__container">
        <div className="gty-form__alert gty-form__alert--warning">
          Collection "{collectionKey}" loaded but has no fillable fields.
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
            {Object.entries(collection.fields || {}).map(([fieldName, fieldDef]) => {
              if (!collection.fillable.includes(fieldName)) {
                console.error(`[Form] Field '${fieldName}' is defined in fields but not in fillable. Skipping.`);
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
