import { useRef, useMemo } from 'react';
import { getFieldTypeDefinition } from '../../fieldTypeRegistry';

/**
 * useField — returns a bound React component for a single named field.
 *
 * The returned component renders the correct Input control for the given
 * field type and config. When placed inside <ComposedForm> (or <AppForm>),
 * it automatically participates in autosave via the GatewayFormContext —
 * no extra wiring needed.
 *
 * The component identity is stable as long as `type` and `name` don't change,
 * so it is safe to use as a JSX element without causing remounts on re-renders.
 * Config changes (label, placeholder, etc.) are always picked up via a ref.
 *
 * @param {object} config
 * @param {string} config.name   — field name (maps to the record key)
 * @param {string} config.type   — registered field type ('text', 'date-picker', etc.)
 * @param {string} [config.label]
 * @param {string} [config.placeholder]
 * @param {boolean} [config.required]
 * @param {*}      [config.*]    — any other field-type-specific options
 *
 * @returns {React.ComponentType} Ready-to-render field component
 *
 * @example
 * function TicketForm({ id }) {
 *   const TitleField    = useField({ name: 'title',    type: 'text',        label: 'Title' })
 *   const DueDateField  = useField({ name: 'due_date', type: 'date-picker', label: 'Due Date' })
 *   const AssigneeField = useField({ name: 'assignee', type: 'relation',    label: 'Assignee',
 *                                    relation: { endpoint: '/users', labelField: 'name' } })
 *
 *   return (
 *     <ComposedForm collection="tasks" recordId={id}>
 *       <div className="ticket-header">
 *         <TitleField />
 *       </div>
 *       <div className="ticket-sidebar">
 *         <DueDateField />
 *         <AssigneeField />
 *       </div>
 *     </ComposedForm>
 *   )
 * }
 */
export function useField(config) {
  // Keep latest config in a ref so the memoised component always uses
  // current values even when type/name are stable.
  const configRef = useRef(config);
  configRef.current = config;

  const type = config?.type;
  const name = config?.name;

  return useMemo(() => {
    const fieldType = getFieldTypeDefinition(type);

    if (!fieldType?.Input) {
      const Unregistered = () => null;
      Unregistered.displayName = `UnregisteredField(${type ?? 'unknown'})`;
      return Unregistered;
    }

    const { Input } = fieldType;

    // Capture configRef (not config) so the closure always reads the
    // latest config without needing to be recreated on every render.
    const BoundField = (props) => (
      <Input config={configRef.current} {...props} />
    );
    BoundField.displayName = `Field(${name || type})`;
    return BoundField;

  // Only recreate the component when type or name changes — anything else
  // (label, placeholder, etc.) flows through the ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, name]);
}
