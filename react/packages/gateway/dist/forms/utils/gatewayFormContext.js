function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { createContext, useContext } from 'react';
import { createFieldRegister, createMockFormState } from "./fieldRegistration";

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
export var createGatewayFormContext = function createGatewayFormContext(methods, collection, recordId, loading, error) {
  var fieldErrors = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var updatingFields = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
  var customRegister = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  var refs = {
    fields: {}
  };

  // Use custom register if provided, otherwise use RHF register
  var baseRegister = customRegister || (methods === null || methods === void 0 ? void 0 : methods.register);
  var register = createFieldRegister(baseRegister);

  // Use RHF formState if available, otherwise create mock
  var formState = (methods === null || methods === void 0 ? void 0 : methods.formState) || createMockFormState(fieldErrors);
  return {
    // Core registration method (abstracted to work with or without RHF)
    register,
    formState,
    // Other RHF methods (may be undefined in non-RHF context)
    setValue: methods === null || methods === void 0 ? void 0 : methods.setValue,
    getValues: methods === null || methods === void 0 ? void 0 : methods.getValues,
    watch: methods === null || methods === void 0 ? void 0 : methods.watch,
    control: methods === null || methods === void 0 ? void 0 : methods.control,
    handleSubmit: methods === null || methods === void 0 ? void 0 : methods.handleSubmit,
    reset: methods === null || methods === void 0 ? void 0 : methods.reset,
    trigger: methods === null || methods === void 0 ? void 0 : methods.trigger,
    clearErrors: methods === null || methods === void 0 ? void 0 : methods.clearErrors,
    setError: methods === null || methods === void 0 ? void 0 : methods.setError,
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
    unregisterFieldRefs: fieldName => {
      delete refs.fields[fieldName];
    },
    isFieldUpdating: fieldName => updatingFields[fieldName] || false,
    getFieldError: fieldName => fieldErrors[fieldName] || null,
    getFieldConfig: fieldName => {
      var _collection$fields;
      if (!(collection !== null && collection !== void 0 && (_collection$fields = collection.fields) !== null && _collection$fields !== void 0 && _collection$fields[fieldName])) return null;
      return _objectSpread({
        name: fieldName
      }, collection.fields[fieldName]);
    }
  };
};
export var GatewayFormContext = /*#__PURE__*/createContext();
export var useGatewayForm = () => {
  var context = useContext(GatewayFormContext);
  if (!context) {
    throw new Error('useGatewayForm must be used within an Form or AppForm component');
  }
  return context;
};

// Export a hook that field components can optionally use for auto-save indicators
export var useGatewayFormField = name => {
  var context = useGatewayForm();
  if (!context.collection) return {
    isUpdating: false,
    error: null
  };
  var validationError = context.formState.errors[name];
  var updateError = context.getFieldError(name);
  var error = validationError || (updateError ? {
    message: updateError
  } : null);
  var isUpdating = context.isFieldUpdating(name);
  return {
    isUpdating,
    error
  };
};