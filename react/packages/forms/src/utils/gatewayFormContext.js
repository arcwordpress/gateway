import { createContext, useContext } from 'react';

/**
 * Utility to create a consistent GatewayFormContext value
 * @param {object} methods - RHF methods from useForm
 * @param {object} collection - Collection data
 * @param {number} recordId - Record ID
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {object} fieldErrors - Field-specific errors (for auto-save)
 * @param {object} updatingFields - Fields currently updating (for auto-save)
 * @returns {object} Context value for GatewayFormContext.Provider
 */
export const createGatewayFormContext = (
  methods,
  collection,
  recordId,
  loading,
  error,
  fieldErrors = {},
  updatingFields = {}
) => ({
  // RHF methods
  ...methods,
  // Shared form data
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
});

export const GatewayFormContext = createContext();

export const useGatewayForm = () => {
  const context = useContext(GatewayFormContext);
  if (!context) {
    throw new Error('useGatewayForm must be used within an AppForm component');
  }
  return context;
};

// Export a hook that field components can optionally use for auto-save indicators
export const useGatewayFormField = (name) => {
  const context = useGatewayForm();
  
  if (!context.collection) return { isUpdating: false, error: null };
  
  const validationError = context.formState.errors[name];
  const updateError = context.getFieldError(name);
  const error = validationError || (updateError ? { message: updateError } : null);
  const isUpdating = context.isFieldUpdating(name);
  
  return { isUpdating, error };
};