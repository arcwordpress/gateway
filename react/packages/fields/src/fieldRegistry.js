import { useMemo } from '@wordpress/element';

/**
 * Field Registry System
 * Central registry that manages all field types for both input and display modes
 */

const fieldRegistry = new Map();

/**
 * Register a field definition in the registry
 * @param {Object} definition - Field definition object with type, Input, Display, etc.
 */
export const registerField = (definition) => {
  if (!definition || !definition.type) {
    throw new Error('Field definition must have a type property');
  }

  if (!definition.Input || !definition.Display) {
    throw new Error(`Field definition for "${definition.type}" must have Input and Display components`);
  }

  fieldRegistry.set(definition.type, definition);
};

/**
 * Get a field definition from the registry
 * @param {string} type - Field type identifier
 * @returns {Object|undefined} Field definition or undefined if not found
 */
export const getFieldDefinition = (type) => {
  return fieldRegistry.get(type);
};

/**
 * Get all registered field types
 * @returns {Array} Array of field type names
 */
export const getRegisteredFieldTypes = () => {
  return Array.from(fieldRegistry.keys());
};

/**
 * Check if a field type is registered
 * @param {string} type - Field type identifier
 * @returns {boolean} True if the field type is registered
 */
export const isFieldTypeRegistered = (type) => {
  return fieldRegistry.has(type);
};

/**
 * Hook to use a field type dynamically
 * @param {string} type - Field type identifier (e.g., 'text')
 * @param {Object} [config={}] - Optional field configuration object (memoize if dynamic to prevent re-renders)
 * @returns {Object} Object with type-specific Input and Display components (e.g., { TextField, TextFieldDisplay })
 * @throws {Error} If field type is not registered
 *
 * @example
 * // Config-optional: Uses defaults
 * const { TextField, TextFieldDisplay } = useField('text');
 * <TextField value="Hello" />
 *
 * @example
 * // With config (memoize for perf)
 * const config = useMemo(() => ({ variant: 'outlined' }), []);
 * const { EmailField } = useField('email', config);
 */
export const useField = (type, config = {}) => {
  const definition = getFieldDefinition(type);

  if (!definition) {
    const availableTypes = getRegisteredFieldTypes().join(', ');
    throw new Error(
      `Field type "${type}" not registered. Available types: ${availableTypes || 'none'}`
    );
  }

  const pascalType = capitalize(type);

  // Memo deps: Exclude config if empty to optimize static usage
  const memoDeps = [definition, config];
  if (Object.keys(config).length === 0) {
    memoDeps.pop(); // Skip config in deps for pure static calls
  }

  return useMemo(() => {
    const InputComponent = (props) => <definition.Input {...props} config={config} />;
    const DisplayComponent = (props) => <definition.Display {...props} config={config} />;
    return {
      [`${pascalType}Field`]: InputComponent,
      [`${pascalType}FieldDisplay`]: DisplayComponent
    };
  }, memoDeps);
};

/**
 * Get the Display component for a field type
 * @param {string} type - Field type identifier
 * @returns {Component|null} Display component or null if not found
 */
export const getFieldDisplay = (type) => {
  const definition = getFieldDefinition(type);
  return definition ? definition.Display : null;
};

/**
 * Get the Input component for a field type
 * @param {string} type - Field type identifier
 * @returns {Component|null} Input component or null if not found
 */
export const getFieldInput = (type) => {
  const definition = getFieldDefinition(type);
  return definition ? definition.Input : null;
};

/**
 * Clear all registered fields from the registry
 * Useful for testing purposes
 */
export const clearFieldRegistry = () => {
  fieldRegistry.clear();
};
