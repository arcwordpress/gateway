/**
 * Field Registration Abstraction Layer
 *
 * This module provides an abstraction over React Hook Form's register function,
 * allowing fields to work in both RHF contexts and custom contexts (like Gutenberg blocks).
 */

/**
 * Creates a registration handler compatible with field components
 *
 * @param {Function|Object} registerFn - Either RHF's register or a custom function
 * @returns {Function} Registration function that fields can use
 *
 * @example
 * // With RHF
 * const rhfRegister = createFieldRegister(methods.register);
 *
 * @example
 * // With Gutenberg
 * const gutenbergRegister = createFieldRegister((name, value) => {
 *   setAttributes({ [name]: value });
 * });
 */
export const createFieldRegister = (registerFn) => {
  // If it's already RHF's register function, return as-is
  // RHF's register returns an object with { name, onChange, onBlur, ref }
  // We detect this by testing if calling it returns an object with the expected shape
  if (typeof registerFn === 'function') {
    try {
      // Test if this is RHF's register by calling it with a test name
      const testResult = registerFn('__test__');

      // Check if the result has RHF's register signature
      if (
        testResult &&
        typeof testResult === 'object' &&
        'name' in testResult &&
        'onChange' in testResult &&
        'onBlur' in testResult &&
        'ref' in testResult &&
        typeof testResult.onChange === 'function'
      ) {
        // This is RHF's register - return it as-is
        return registerFn;
      }
    } catch (e) {
      // If calling it throws, it's not RHF's register
      // Fall through to custom handler
    }
  }

  // Custom registration handler (for Gutenberg blocks, etc.)
  if (typeof registerFn === 'function') {
    return (name, options = {}) => {
      // Return props that field components expect (RHF-compatible API)
      return {
        name,
        onChange: (e) => {
          // Handle different input types
          let value;

          if (e && typeof e === 'object') {
            // Handle React synthetic events
            if (e.target) {
              const target = e.target;

              if (target.type === 'checkbox') {
                value = target.checked;
              } else if (target.type === 'number') {
                value = target.valueAsNumber || parseFloat(target.value) || 0;
              } else if (target.type === 'file') {
                value = target.files;
              } else {
                value = target.value;
              }
            } else {
              // Handle custom events (like from select libraries)
              value = e.value !== undefined ? e.value : e;
            }
          } else {
            // Direct value passed
            value = e;
          }

          registerFn(name, value, options);
        },
        onBlur: (e) => {
          // Optional: call custom blur handler if needed
          if (options.onBlur) {
            options.onBlur(e);
          }
        },
        ref: (el) => {
          // Optional: store ref if needed
          if (options.ref) {
            options.ref(el);
          }
        }
      };
    };
  }

  // Fallback: no-op register for display-only contexts
  console.warn('No valid register function provided to createFieldRegister');
  return (name) => ({
    name,
    onChange: () => {},
    onBlur: () => {},
    ref: () => {}
  });
};

/**
 * Creates a mock formState for non-RHF contexts
 *
 * @param {Object} errors - Field errors object { fieldName: { message: 'error' } }
 * @param {Object} options - Additional formState options
 * @returns {Object} FormState-like object compatible with RHF
 */
export const createMockFormState = (errors = {}, options = {}) => ({
  errors: errors || {},
  isDirty: options.isDirty || false,
  isSubmitting: options.isSubmitting || false,
  isValid: Object.keys(errors).length === 0,
  touchedFields: options.touchedFields || {},
  dirtyFields: options.dirtyFields || {},
  isSubmitted: options.isSubmitted || false,
  isValidating: options.isValidating || false,
  submitCount: options.submitCount || 0
});

/**
 * Creates a Gutenberg-compatible register function
 *
 * @param {Function} setAttributes - Gutenberg's setAttributes function
 * @returns {Function} Register function compatible with createFieldRegister
 *
 * @example
 * const register = createGutenbergRegister(setAttributes);
 * const fieldRegister = createFieldRegister(register);
 */
export const createGutenbergRegister = (setAttributes) => {
  return (name, value) => {
    setAttributes({ [name]: value });
  };
};
