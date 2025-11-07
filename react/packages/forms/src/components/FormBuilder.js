import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, createRecord, getRecord, updateRecord } from '../services/api';
import { useFieldType } from '@arcwp/gateway-fields';
import { generateZodSchema } from '../utils/zodSchemaGenerator';

// Import the shared context
import { GatewayFormContext, useGatewayForm } from './AppForm';

// Memoized field renderer - now uses context instead of props
const FieldRenderer = React.memo(({ fieldConfig }) => {
    const { Input } = useFieldType(fieldConfig);
    const { formState } = useGatewayForm();
    const error = formState.errors[fieldConfig.name];
    return <Input config={fieldConfig} error={error} />;
});

// Add apiAuth to props
const FormBuilder = ({ collectionKey, recordId, apiAuth }) => {
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

  // Map collection config types to field registry types
  const mapConfigTypeToFieldType = (configType, fieldName, casts = {}) => {
    // Direct mapping from config type to field type
    const typeMapping = {
      'sortable_children': 'sortable-children',
      'relation': 'relation',
      'select': 'select',
      'radio': 'radio',
      'button_group': 'button-group',
      'email': 'email',
      'url': 'url',
      'markdown': 'markdown',
      'wysiwyg': 'wysiwyg',
      'textarea': 'textarea',
      'number': 'number',
      'password': 'password',
      'range': 'range',
      'color': 'color-picker',
      'readonly': 'readonly',
      'hidden': 'hidden',
      'date_picker': 'date-picker',
      'time_picker': 'time-picker',
      'datetime_picker': 'datetime-picker',
      'image': 'image',
      'file': 'file',
      'gallery': 'gallery',
      'link': 'link',
      'oembed': 'oembed',
      'post_object': 'post-object',
      'user': 'user'
    };

    // If explicit config type, use it
    if (configType && typeMapping[configType]) {
      return typeMapping[configType];
    }

    // Check casts
    if (casts[fieldName]) {
      const cast = casts[fieldName];
      if (cast === 'datetime' || cast === 'date') return 'date-picker';
      if (cast === 'integer' || cast === 'int') return 'number';
      if (cast === 'boolean') return 'checkbox';
    }

    // Infer from field name
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('password')) return 'password';
    if (fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('link')) return 'url';
    if (fieldName === 'description') return 'textarea';

    // Default to text
    return 'text';
  };

  // Combined context value to provide to children (fields)
  const contextValue = useMemo(() => ({
    // RHF methods
    ...methods,
    // FormBuilder data
    collection,
    recordId,
    loading,
    error,
    fieldErrors: {}, // FormBuilder doesn't have auto-save errors
    updatingFields: {}, // No auto-save
    isFieldUpdating: () => false,
    getFieldError: () => null,
    getFieldConfig: (fieldName) => {
      if (!collection?.fields?.[fieldName]) return null;
      return { name: fieldName, ...collection.fields[fieldName] };
    },
  }), [methods, collection, recordId, loading, error]);

  if (!collectionKey) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No collection key provided. Add data-collection attribute.
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

  if (!collection || !collection.fillable) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Collection "{collectionKey}" loaded but has no fillable fields.
        </div>
      </div>
    );
  }

  return (
    <GatewayFormContext.Provider value={contextValue}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            {collection.fillable.map((fieldName) => {
              // Ensure fieldConfig includes the field name
              const fieldConfig = { name: fieldName, ...(collection.fields?.[fieldName] || {}) };
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Record' : 'Create Record')}
            </button>
          </form>
        </div>
      </div>
    </GatewayFormContext.Provider>
  );
};

export default FormBuilder;
