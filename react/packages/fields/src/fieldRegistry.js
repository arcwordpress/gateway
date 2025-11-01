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
 * @param {string} type - Field type identifier
 * @param {Object} config - Field configuration object (should be memoized by caller to prevent unnecessary re-renders)
 * @returns {Object} Object with Input and Display components
 * @throws {Error} If field type is not registered
 *
 * @example
 * // Memoize config to prevent re-renders
 * const config = useMemo(() => ({ labelField: 'name' }), []);
 * const { Display } = useField('relation', config);
 */
export const useField = (type, config = {}) => {
  const definition = getFieldDefinition(type);

  if (!definition) {
    const availableTypes = getRegisteredFieldTypes().join(', ');
    throw new Error(
      `Field type "${type}" not registered. Available types: ${availableTypes || 'none'}`
    );
  }

  return useMemo(() => ({
    Input: (props) => <definition.Input {...props} config={config} />,
    Display: (props) => <definition.Display {...props} config={config} />
  }), [definition, config]);
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
