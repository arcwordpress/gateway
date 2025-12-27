/**
 * AppForm - Form state manager with auto-save functionality
 *
 * Notes:
 * - The `collection` prop accepts either a string collection key (which triggers a network fetch)
 *   or a collection JSON object (which is used immediately without fetching).
 * - `collectionKey` prop is deprecated but still supported for backward compatibility.
 * - If neither `collection` (object) nor a collection key is provided, the component renders silently in demo/offline mode
 *   (no validation or auto-save).
 * - Auto-save runs only when both `recordId` and a valid collection endpoint are available.
 * - Runtime safety: component is silent by default (no console output or UI banners) when `collection` or `recordId` are missing;
 *   it guards against missing data and should not throw uncaught errors. Consuming code (children) should be prepared to receive
 *   `null` or incomplete `collection` values from context until load succeeds.
 *
 * Recommended usage:
 * - Prefer passing `collection` (object) or a collection key string; pass `recordId` for auto-save.
 * - Use `onLoad`, `onFieldUpdate`, and `onFieldError` as needed.
 *
 * @param {string|object} props.collection - Collection key (string) or collection JSON (object)
 * @param {string} [props.collectionKey] - Deprecated: collection key to load (use `collection` instead)
 * @param {number} props.recordId - Record ID to edit (required for auto-save)
 * @param {object} [props.apiAuth] - Optional auth object passed to API helpers
 * @param {function} [props.onFieldUpdate] - Callback invoked after a successful field update
 * @param {function} [props.onFieldError] - Callback invoked when field update fails
 * @param {function} [props.onLoad] - Callback invoked after collection and record are successfully loaded
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, getRecord, updateRecord } from '../../services/api';
import { generateZodSchema } from '../../utils/zodSchemaGenerator';
import { createGatewayFormContext, GatewayFormContext } from '../../utils/gatewayFormContext';

// Helper: determine whether a prop is a collection key (string) or an actual collection object
const isCollectionKey = (value) => typeof value === 'string' && value.trim().length > 0;
const isCollectionObject = (value) => {
  return value && typeof value === 'object' && (
    Array.isArray(value.fields) || // typical collection shape
    typeof value.routes === 'object' ||
    typeof value.key === 'string'
  );
};

const AppForm = ({ 
  collectionKey, // deprecated: prefer `collection` prop
  collection: collectionProp, // can be a string key or a collection object
  recordId, 
  apiAuth, 
  onFieldUpdate, 
  onFieldError,
  onLoad,
  children 
}) => {
  // Derive whether we were given a key or an object via the `collection` prop
  const providedCollectionKey = isCollectionKey(collectionProp) ? collectionProp : collectionKey;
  const immediateCollection = isCollectionObject(collectionProp) ? collectionProp : null;
  const [collection, setCollection] = useState(immediateCollection || null);
  // Only set loading when we expect to fetch a remote collection
  const [loading, setLoading] = useState(Boolean(providedCollectionKey && !immediateCollection));
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [updatingFields, setUpdatingFields] = useState({});

  const updateTimeoutRef = useRef({});
  const previousValuesRef = useRef({});

  // Generate validation schema from collection data
  const validationSchema = useMemo(() => {
    if (!collection) return null;
    return generateZodSchema(collection);
  }, [collection]);

  const methods = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onChange',
  });

  const { reset, watch } = methods;
  const formValues = watch();

  useEffect(() => {
    if (providedCollectionKey && !immediateCollection) {
      loadCollection();
    } else if (!providedCollectionKey && !immediateCollection) {
      setLoading(false);
    }
  }, [providedCollectionKey, immediateCollection]);

  useEffect(() => {
    if (recordId && collection) {
      loadRecord();
    }
  }, [recordId, collection]);

  // Watch for field changes and trigger auto-save
  useEffect(() => {
    if (!collection || !recordId || loading) return;

    Object.keys(formValues).forEach(fieldName => {
      const currentValue = formValues[fieldName];
      const previousValue = previousValuesRef.current[fieldName];

      if (currentValue === previousValue || updatingFields[fieldName]) {
        return;
      }

      previousValuesRef.current[fieldName] = currentValue;

      if (previousValue === undefined) {
        return;
      }

      if (updateTimeoutRef.current[fieldName]) {
        clearTimeout(updateTimeoutRef.current[fieldName]);
      }

      updateTimeoutRef.current[fieldName] = setTimeout(() => {
        updateField(fieldName, currentValue);
      }, 300);
    });
  }, [formValues, collection, recordId, loading]);

  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCollection(providedCollectionKey, { auth: apiAuth });
      console.log('Collection response:', response);
      setCollection(response);
    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? `Collection "${providedCollectionKey}" not found`
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

      if (response.data) {
        reset(response.data);
        previousValuesRef.current = { ...response.data };
      }

      // Call onLoad callback if provided
      if (onLoad) {
        onLoad(collection, response.data);
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

  const updateField = async (fieldName, value) => {
    const endpoint = collection?.routes?.endpoint;
    if (!endpoint) {
      console.error('No endpoint available for update');
      return;
    }

    try {
      setUpdatingFields(prev => ({ ...prev, [fieldName]: true }));

      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      const updateData = { [fieldName]: value };

      console.log(`[AppForm] Updating field "${fieldName}":`, value);

      const response = await updateRecord(endpoint, recordId, updateData, { auth: apiAuth });

      console.log(`[AppForm] Field "${fieldName}" updated successfully:`, response);

      if (onFieldUpdate) {
        onFieldUpdate(fieldName, value, response);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update field';
      console.error(`[AppForm] Error updating field "${fieldName}":`, err);

      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));

      if (onFieldError) {
        onFieldError(fieldName, value, errorMessage);
      }
    } finally {
      setUpdatingFields(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    }
  };

  const contextValue = useMemo(() => createGatewayFormContext(
    methods,
    collection,
    recordId,
    loading,
    error,
    fieldErrors,
    updatingFields
  ), [methods, collection, recordId, loading, error, fieldErrors, updatingFields]);

  if (loading) {
    const displayKey = providedCollectionKey || collection?.key || '';
    return <div className="gty-appform__container">Loading collection "{displayKey}"...</div>;
  }

  if (error) {
    return (
      <div className="gty-appform__container">
        <div className="gty-appform__alert gty-appform__alert--error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <GatewayFormContext.Provider value={contextValue}>
      <div className="gty-appform">
        {children}
      </div>
    </GatewayFormContext.Provider>
  );
};

export { AppForm };