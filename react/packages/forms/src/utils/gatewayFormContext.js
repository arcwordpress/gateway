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