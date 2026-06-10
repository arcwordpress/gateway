import { createContext, useContext } from 'react';
import { createFieldRegister, createMockFormState } from './fieldRegistration';

/**
 * Utility to create a consistent GatewayFormContext value
 * @param {object} methods - RHF methods from useForm
 * @param {object} collection - Collection data
 * @param {number} recordId - Record ID
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {object} fieldErrors - Field-specific errors (for auto-save)
 * @param {object} updatingFields - Fields currently updating (for auto-save)
 * @param {Function} customRegister - Custom register function (for non-RHF contexts like Gutenberg)
 * @returns {object} Context value for GatewayFormContext.Provider
 */
export const createGatewayFormContext = (
  methods,
  collection,
  recordId,
  loading,
  error,
  fieldErrors = {},
  updatingFields = {},
  customRegister = null
) => {
  const refs = {
    fields: {}
  };

  // Use custom register if provided, otherwise use RHF register
  const baseRegister = customRegister || methods?.register;
  const register = createFieldRegister(baseRegister);

  // Use RHF formState if available, otherwise create mock
  const formState = methods?.formState || createMockFormState(fieldErrors);

  return {
    // Core registration method (abstracted to work with or without RHF)
    register,
    formState,
    // Other RHF methods (may be undefined in non-RHF context)
    setValue: methods?.setValue,
    getValues: methods?.getValues,
    unregister: methods?.unregister,
    watch: methods?.watch,
    control: methods?.control,
    handleSubmit: methods?.handleSubmit,
    reset: methods?.reset,
    trigger: methods?.trigger,
    clearErrors: methods?.clearErrors,
    setError: methods?.setError,
    // Shared form data
    collection,
    recordId,
    loading,
    error,
    fieldErrors,
    updatingFields,
    // Refs management
    refs,
    registerFieldRefs: (fieldName, fieldRefs) => {
      refs.fields[fieldName] = fieldRefs;
    },
    unregisterFieldRefs: (fieldName) => {
      delete refs.fields[fieldName];
    },
    isFieldUpdating: (fieldName) => updatingFields[fieldName] || false,
    // Placeholder — Form.js spreads its own saveParent over this.
    saveParent: null,
    getFieldError: (fieldName) => fieldErrors[fieldName] || null,
    getFieldConfig: (fieldName) => {
      if (!collection?.fields?.[fieldName]) return null;
      return { name: fieldName, ...collection.fields[fieldName] };
    },
  };
};

export const GatewayFormContext = createContext();

export const useGatewayForm = () => {
  const context = useContext(GatewayFormContext);
  if (!context) {
    throw new Error('useGatewayForm must be used within an Form or AppForm component');
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