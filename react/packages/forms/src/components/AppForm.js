import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, getRecord, updateRecord } from '../services/api';
import { generateZodSchema } from '../utils/zodSchemaGenerator';

// Context to provide form state and methods to children
const AppFormContext = createContext({
  collection: null,
  getFieldConfig: () => null,
  getFieldError: () => null,
  isFieldUpdating: () => false,
  fieldErrors: {},
  updatingFields: new Set()
});

export const useAppForm = () => {
  const context = useContext(AppFormContext);
  if (!context) {
    throw new Error('useAppForm must be used within an AppForm component');
  }
  return context;
};

// Export a hook that field components can optionally use for auto-save indicators
export const useAppFormField = (name) => {
  const context = useAppForm();
  const { formState: { errors } } = useFormContext();
  
  if (!context.collection) return { isUpdating: false, error: null };
  
  const validationError = errors[name];
  const updateError = context.getFieldError(name);
  const error = validationError || (updateError ? { message: updateError } : null);
  const isUpdating = context.isFieldUpdating(name);
  
  return { isUpdating, error };
};

/**
 * AppForm - Form state manager with auto-save functionality
 * Allows custom layouts by passing field components as children
 *
 * @param {string} collectionKey - The collection key to load
 * @param {number} recordId - The record ID to edit (required for auto-save)
 * @param {object} apiAuth - Optional API authentication credentials
 * @param {function} onFieldUpdate - Optional callback when a field updates successfully
 * @param {function} onFieldError - Optional callback when a field update fails
 * @param {function} onLoad - Optional callback when collection and record are loaded
 * @param {ReactNode} children - Custom layout with field components
 */
const AppForm = ({ 
  collectionKey, 
  recordId, 
  apiAuth, 
  onFieldUpdate, 
  onFieldError,
  onLoad,
  children 
}) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (collectionKey) {
      loadCollection();
    }
  }, [collectionKey]);

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
      const response = await getCollection(collectionKey, { auth: apiAuth });
      console.log('Collection response:', response);
      setCollection(response.data);
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

  // Context value to provide to children
  const contextValue = useMemo(() => ({
    collection,
    recordId,
    loading,
    error,
    fieldErrors,
    updatingFields,
    isFieldUpdating: (fieldName) => updatingFields[fieldName] || false,
    getFieldError: (fieldName) => fieldErrors[fieldName] || null,
    getFieldConfig: (fieldName) => {
      if (!collection?.fields?.[fieldName]) return null;
      return { name: fieldName, ...collection.fields[fieldName] };
    },
  }), [collection, recordId, loading, error, fieldErrors, updatingFields]);

  if (!collectionKey) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No collection key provided. Add collectionKey prop.
        </div>
      </div>
    );
  }

  if (!recordId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No record ID provided. AppForm requires a record ID for auto-save functionality.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading collection "{collectionKey}"...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Collection "{collectionKey}" could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <AppFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    </AppFormContext.Provider>
  );
};

export default AppForm;