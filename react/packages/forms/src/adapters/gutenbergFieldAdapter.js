/**
 * Gutenberg Field Adapter
 *
 * This module provides adapters to use Gateway Fields in Gutenberg blocks.
 * Supports both batch rendering and individual field composition for complex layouts.
 */

import { useMemo } from '@wordpress/element';
import { GatewayFormContext, createGatewayFormContext } from '../utils/gatewayFormContext';
import { createGutenbergRegister } from '../utils/fieldRegistration';
import { useFieldType } from '../fieldTypeRegistry';

/**
 * Provider component that sets up Gateway Field context for Gutenberg blocks
 *
 * Wrap your InspectorControls (or any section) with this provider, then use
 * individual fields anywhere within using useFieldType or useGutenbergField.
 *
 * @param {Object} props
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Block setAttributes function
 * @param {React.ReactNode} props.children - Child components
 *
 * @example
 * <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
 *   <PanelBody title="Settings">
 *     <TextField config={titleConfig} />
 *     <SelectField config={layoutConfig} />
 *   </PanelBody>
 * </GutenbergFieldProvider>
 */
export const GutenbergFieldProvider = ({ attributes, setAttributes, children }) => {
  // Create a custom register function for Gutenberg
  const gutenbergRegister = useMemo(
    () => createGutenbergRegister(setAttributes),
    [setAttributes]
  );

  // Create context value with custom register
  const contextValue = useMemo(
    () => createGatewayFormContext(
      null, // no RHF methods
      null, // no collection
      null, // no recordId
      false, // not loading
      null, // no error
      {}, // no fieldErrors
      {}, // no updatingFields
      gutenbergRegister // custom register function
    ),
    [gutenbergRegister]
  );

  return (
    <GatewayFormContext.Provider value={contextValue}>
      {children}
    </GatewayFormContext.Provider>
  );
};

/**
 * Hook to use Gateway Fields in Gutenberg blocks with full control
 *
 * This hook provides the Input and Display components for a field,
 * along with field props needed for Gutenberg context.
 *
 * @param {Object} config - Field configuration
 * @param {Object} attributes - Block attributes
 * @returns {Object} { Input, Display, fieldProps }
 *
 * @example
 * const titleConfig = { type: 'text', name: 'title', label: 'Title' };
 * const { Input: TitleField, fieldProps } = useGutenbergField(titleConfig, attributes);
 * <TitleField config={titleConfig} {...fieldProps} />
 */
export const useGutenbergField = (config, attributes) => {
  const { Input, Display } = useFieldType(config);

  // Field props to pass current value from attributes
  const fieldProps = useMemo(() => ({
    value: attributes[config.name],
    defaultValue: attributes[config.name]
  }), [attributes, config.name]);

  return { Input, Display, fieldProps };
};

/**
 * Individual field component for Gutenberg blocks
 *
 * Use this when you want to render a single field within a GutenbergFieldProvider.
 * This component automatically gets the value from attributes via context.
 *
 * @param {Object} props
 * @param {Object} props.config - Field configuration
 * @param {Object} props.attributes - Block attributes (for getting current value)
 *
 * @example
 * <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
 *   <GutenbergField config={{ type: 'text', name: 'title', label: 'Title' }} attributes={attributes} />
 * </GutenbergFieldProvider>
 */
export const GutenbergField = ({ config, attributes }) => {
  const { Input, fieldProps } = useGutenbergField(config, attributes);

  return <Input config={config} {...fieldProps} />;
};

/**
 * Batch field renderer for multiple fields
 *
 * Use this when you want to render multiple fields at once without custom layout.
 * For complex layouts with tabs/accordions, use GutenbergFieldProvider with individual fields.
 *
 * @param {Object} props
 * @param {Array} props.fields - Array of field configurations
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Block setAttributes function
 *
 * @example
 * // Simple batch rendering
 * <GutenbergFieldGroup
 *   fields={[
 *     { type: 'text', name: 'title', label: 'Title' },
 *     { type: 'select', name: 'layout', label: 'Layout', options: [...] }
 *   ]}
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 * />
 */
export const GutenbergFieldGroup = ({ fields, attributes, setAttributes }) => {
  return (
    <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
      {fields.map((fieldConfig) => {
        try {
          return (
            <GutenbergField
              key={fieldConfig.name}
              config={fieldConfig}
              attributes={attributes}
            />
          );
        } catch (e) {
          console.error('Error rendering field:', fieldConfig, e);
          return null;
        }
      })}
    </GutenbergFieldProvider>
  );
};

/**
 * Hook for advanced usage - get raw context and field type
 *
 * Use this when you need full control over rendering and want to access
 * the Gateway Form context directly.
 *
 * @param {Object} config - Field configuration
 * @param {Object} attributes - Block attributes
 * @param {Function} setAttributes - Block setAttributes function
 * @returns {Object} { Input, Display, contextValue, fieldProps }
 *
 * @example
 * const { Input, contextValue, fieldProps } = useGutenbergFieldWithContext(
 *   config,
 *   attributes,
 *   setAttributes
 * );
 *
 * <GatewayFormContext.Provider value={contextValue}>
 *   <CustomWrapper>
 *     <Input config={config} {...fieldProps} />
 *   </CustomWrapper>
 * </GatewayFormContext.Provider>
 */
export const useGutenbergFieldWithContext = (config, attributes, setAttributes) => {
  const { Input, Display } = useFieldType(config);

  // Create context value
  const gutenbergRegister = useMemo(
    () => createGutenbergRegister(setAttributes),
    [setAttributes]
  );

  const contextValue = useMemo(
    () => createGatewayFormContext(
      null, null, null, false, null, {}, {},
      gutenbergRegister
    ),
    [gutenbergRegister]
  );

  // Field props
  const fieldProps = useMemo(() => ({
    value: attributes[config.name],
    defaultValue: attributes[config.name]
  }), [attributes, config.name]);

  return { Input, Display, contextValue, fieldProps };
};
