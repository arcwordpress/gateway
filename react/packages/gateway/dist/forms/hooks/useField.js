function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useRef, useMemo } from 'react';
import { getFieldTypeDefinition } from "../fieldTypeRegistry";

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
import { jsx as _jsx } from "react/jsx-runtime";
export function useField(config) {
  // Keep latest config in a ref so the memoised component always uses
  // current values even when type/name are stable.
  var configRef = useRef(config);
  configRef.current = config;
  var type = config === null || config === void 0 ? void 0 : config.type;
  var name = config === null || config === void 0 ? void 0 : config.name;
  return useMemo(() => {
    var fieldType = getFieldTypeDefinition(type);
    if (!(fieldType !== null && fieldType !== void 0 && fieldType.Input)) {
      var Unregistered = () => null;
      Unregistered.displayName = "UnregisteredField(".concat(type !== null && type !== void 0 ? type : 'unknown', ")");
      return Unregistered;
    }
    var Input = fieldType.Input;

    // Capture configRef (not config) so the closure always reads the
    // latest config without needing to be recreated on every render.
    var BoundField = props => /*#__PURE__*/_jsx(Input, _objectSpread({
      config: configRef.current
    }, props));
    BoundField.displayName = "Field(".concat(name || type, ")");
    return BoundField;

    // Only recreate the component when type or name changes — anything else
    // (label, placeholder, etc.) flows through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, name]);
}