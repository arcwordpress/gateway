import { useMemo } from '@wordpress/element';

/**
 * Field Type Registry System
 * Central registry that manages all field types (not field instances) for both input and display modes
 */

const fieldTypeRegistry = new Map();

/**
 * Register a field type definition in the registry
 * @param {Object} definition - Field type definition object with type, Input, Display, etc.
 */
export const registerFieldType = (definition) => {
  if (!definition || !definition.type) {
    throw new Error('Field type definition must have a type property');
  }

  if (!definition.Input || !definition.Display) {
    throw new Error(`Field type definition for "${definition.type}" must have Input and Display components`);
  }

  fieldTypeRegistry.set(definition.type, definition);
};

/**
 * Get a field type definition from the registry
 * @param {string} type - Field type identifier
 * @returns {Object|undefined} Field type definition or undefined if not found
 */
export const getFieldTypeDefinition = (type) => {
  return fieldTypeRegistry.get(type);
};

/**
 * Get all registered field types
 * @returns {Array} Array of field type identifiers
 */
export const getRegisteredFieldTypes = () => {
  return Array.from(fieldTypeRegistry.keys());
};

/**
 * Check if a field type is registered
 * @param {string} type - Field type identifier
 * @returns {boolean} True if the field type is registered
 */
export const isFieldTypeRegistered = (type) => {
  return fieldTypeRegistry.has(type);
};

/**
 * Hook to use a field type from a field config object
 * @param {Object} config - Field config; must include 'type' (registered type) and 'name' (field name for RHF/register)
 * @returns {Object} { Input, Display } — the field type components from the registry
 * @throws {Error} If 'type' missing, invalid, or not registered; or 'name' missing
 *
 * @example
 * const config = { type: 'text', name: 'firstName', label: 'First Name' };
 * const { Input } = useFieldType(config);
 * <Input {...register(config.name)} config={config} />
 */
export const useFieldType = (config) => {
  if (!config) {
    throw new Error('useFieldType: Config object is required');
  }

  const { type, name } = config;

  if (!type) {
    throw new Error('useFieldType: Config must include "type" (e.g., "text")');
  }

  if (!name) {
    throw new Error('useFieldType: Config must include "name" (e.g., "firstName") for form integration');
  }

  const definition = getFieldTypeDefinition(type);

  if (!definition) {
    const availableTypes = getRegisteredFieldTypes().join(', ');
    throw new Error(
      `Field type "${type}" not registered. Available types: ${availableTypes || 'none'}`
    );
  }

  // Return the actual components from the definition - they're stable references
  // The consumer should pass config as a prop
  return useMemo(() => ({
    Input: definition.Input,
    Display: definition.Display
  }), [definition]);
};

/**
 * Get the Display component for a field type
 * @param {string} type - Field type identifier
 * @returns {Component|null} Display component or null if not found
 */
export const getFieldTypeDisplay = (type) => {
  const definition = getFieldTypeDefinition(type);
  return definition ? definition.Display : null;
};

/**
 * Get the Input component for a field type
 * @param {string} type - Field type identifier
 * @returns {Component|null} Input component or null if not found
 */
export const getFieldTypeInput = (type) => {
  const definition = getFieldTypeDefinition(type);
  return definition ? definition.Input : null;
};