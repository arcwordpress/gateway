import { useMemo } from 'react';
import { useGatewayForm } from '../utils/gatewayFormContext';
import { getFieldTypeDefinition } from '../fieldTypeRegistry';

/**
 * Generic hook for composing individual fields inside a ComposedForm / AppForm.
 *
 * Reads the field's type and config from the collection in context, merges any
 * local overrides, looks up the registered Input/Display components, and returns
 * them pre-bound to the resolved config. Autosave is handled automatically by the
 * parent AppForm/ComposedForm — nothing extra is needed here.
 *
 * Must be called inside a component rendered within <ComposedForm> or <AppForm>.
 *
 * @param {string} name - The field name as it appears in the collection schema.
 * @param {object} [configOverride={}] - Optional overrides merged on top of the
 *   collection config (e.g. { label: 'Custom Label' }). Should be a stable
 *   reference (defined outside render or memoized) to avoid unnecessary re-renders.
 *
 * @returns {{ Input: React.ComponentType, Display: React.ComponentType }}
 *   Input  — full field with label/help/control chrome, ready to drop anywhere.
 *   Display — read-only display version of the value.
 *
 * @example
 * // Basic — config comes entirely from the collection
 * const { Input: TitleField } = useField('title');
 * <TitleField />
 *
 * @example
 * // With a label override
 * const dueDateConfig = { label: 'Due Date' };
 * const { Input: DueDateField } = useField('due_date', dueDateConfig);
 * <DueDateField />
 *
 * @example
 * // Passing extra props at render time (merged on top of hook config)
 * const { Input: PriorityField } = useField('priority');
 * <PriorityField config={{ placeholder: 'Pick a priority...' }} />
 */
export const useField = (name, configOverride = {}) => {
  const { getFieldConfig } = useGatewayForm();

  // Collection config may be null while the collection is still loading — that's fine.
  const collectionConfig = getFieldConfig(name);

  const config = useMemo(() => ({
    name,
    ...(collectionConfig || {}),
    ...configOverride,
  }), [name, collectionConfig, configOverride]);

  const definition = config.type ? getFieldTypeDefinition(config.type) : null;

  return useMemo(() => {
    if (!definition) {
      // Collection not loaded yet, or field type unknown — render nothing silently.
      const Noop = () => null;
      return { Input: Noop, Display: Noop };
    }

    const { Input: RegistryInput, Display: RegistryDisplay } = definition;

    return {
      Input: ({ config: propConfig, ...props } = {}) => {
        const mergedConfig = propConfig ? { ...config, ...propConfig } : config;
        return <RegistryInput config={mergedConfig} {...props} />;
      },
      Display: ({ config: propConfig, ...props } = {}) => {
        const mergedConfig = propConfig ? { ...config, ...propConfig } : config;
        return <RegistryDisplay config={mergedConfig} {...props} />;
      },
    };
  }, [definition, config]);
};
