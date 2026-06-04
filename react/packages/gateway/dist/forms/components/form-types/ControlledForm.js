function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * ControlledForm - Render-only form wrapper for non-API contexts
 *
 * Provides GatewayFormContext with working watch(), setValue(), getValues() and
 * register() implementations backed by a plain values object and an onChange
 * callback. No API calls, no automatic saving — the consumer owns persistence.
 *
 * Use cases:
 * - Exta builder field-config editing (values = field config JSON, onChange updates builder state)
 * - Gutenberg block inspector controls (via BlockForm wrapper)
 * - Options pages, meta boxes, or any context where fields write to external state
 *
 * @param {Object}   props.values    - Current values keyed by field name
 * @param {Function} props.onChange   - Called as onChange(fieldName, value) on every field change
 * @param {Array}    [props.fields]   - Optional field config array for auto-rendering
 * @param {boolean}  [props.validate] - Enable Zod validation from field configs (default false)
 * @param {Object}   [props.collection] - Optional collection object (for validation / metadata)
 * @param {React.ReactNode} [props.children] - Custom layout; when present, auto-render is skipped
 */

import { useMemo, useCallback, useRef } from 'react';
import { GatewayFormContext, createGatewayFormContext } from "../../utils/gatewayFormContext";
import { createControlledRegister, createMockFormState } from "../../utils/fieldRegistration";
import { generateZodSchema, generateZodSchemaFromFields } from "../../utils/zodSchemaGenerator";
import { useFieldType } from "../../fieldTypeRegistry";

/**
 * Build a methods-compatible shim that satisfies the interface field components
 * expect from useGatewayForm() — specifically watch(), setValue(), getValues().
 *
 * This shim is passed as the `methods` parameter to createGatewayFormContext so
 * that every context property (watch, setValue, getValues, formState, etc.) is a
 * working function rather than undefined.
 */
import { jsx as _jsx } from "react/jsx-runtime";
var createControlledMethods = (valuesRef, onChange, errors) => {
  // watch(name?) — returns current value(s) synchronously.
  // Supports: watch() → all values, watch('name') → single value.
  // The callback subscription form (used by slug field) is stubbed to a no-op
  // unsubscribe; ControlledForm re-renders on every values change which
  // achieves the same reactive result for the vast majority of field types.
  var watch = nameOrCallback => {
    if (typeof nameOrCallback === 'function') {
      // Subscription form — return unsubscribe no-op.
      // The component will still re-render because values prop changes.
      return {
        unsubscribe: () => {}
      };
    }
    if (nameOrCallback === undefined) {
      return _objectSpread({}, valuesRef.current);
    }
    return valuesRef.current[nameOrCallback];
  };
  var setValue = (name, value, _options) => {
    onChange(name, value);
  };
  var getValues = name => {
    if (name === undefined) {
      return _objectSpread({}, valuesRef.current);
    }
    return valuesRef.current[name];
  };
  return {
    // These are consumed directly by createGatewayFormContext
    register: null,
    // will be overridden by customRegister path
    formState: createMockFormState(errors || {}),
    setValue,
    getValues,
    watch,
    control: null,
    handleSubmit: fn => e => {
      var _e$preventDefault;
      e === null || e === void 0 || (_e$preventDefault = e.preventDefault) === null || _e$preventDefault === void 0 || _e$preventDefault.call(e);
      fn(valuesRef.current);
    },
    reset: () => {},
    trigger: () => Promise.resolve(true),
    clearErrors: () => {},
    setError: () => {}
  };
};

/** Auto-renders a single field from config, reading Input from the registry. */
var ControlledFieldRenderer = _ref => {
  var config = _ref.config;
  var _useFieldType = useFieldType(config),
    Input = _useFieldType.Input;
  return /*#__PURE__*/_jsx(Input, {
    config: config
  });
};
var ControlledForm = _ref2 => {
  var _ref2$values = _ref2.values,
    values = _ref2$values === void 0 ? {} : _ref2$values,
    onChange = _ref2.onChange,
    fields = _ref2.fields,
    _ref2$validate = _ref2.validate,
    validate = _ref2$validate === void 0 ? false : _ref2$validate,
    _ref2$collection = _ref2.collection,
    collection = _ref2$collection === void 0 ? null : _ref2$collection,
    children = _ref2.children;
  // Keep a ref that is always current so watch() inside the shim reads fresh values
  // without needing to recreate the methods object on every render.
  var valuesRef = useRef(values);
  valuesRef.current = values;

  // Stable onChange wrapper
  var onChangeStable = useCallback((name, value) => {
    if (typeof onChange === 'function') {
      onChange(name, value);
    }
  }, [onChange]);

  // Optional validation schema
  var validationSchema = useMemo(() => {
    if (!validate) return null;
    if (collection) return generateZodSchema(collection);
    if (fields && Array.isArray(fields)) return generateZodSchemaFromFields(fields);
    return null;
  }, [validate, collection, fields]);

  // TODO: wire up live validation errors from validationSchema when validate=true.
  // For now we pass an empty errors object.
  var errors = {};
  var controlledRegister = useMemo(() => createControlledRegister(onChangeStable), [onChangeStable]);
  var controlledMethods = useMemo(() => createControlledMethods(valuesRef, onChangeStable, errors),
  // valuesRef.current is always up-to-date so watch() reads fresh values
  // without needing to recreate the methods object on every render.
  [onChangeStable]);
  var contextValue = useMemo(() => createGatewayFormContext(controlledMethods,
  // methods shim with watch/setValue/getValues
  collection,
  // may be null — that's fine
  null,
  // no recordId
  false,
  // not loading
  null,
  // no error
  {},
  // no fieldErrors
  {},
  // no updatingFields
  controlledRegister // custom register for the onChange pathway
  ), [controlledMethods, collection, controlledRegister]);

  // When children are provided, render them inside context (custom layout).
  if (children) {
    return /*#__PURE__*/_jsx(GatewayFormContext.Provider, {
      value: contextValue,
      children: typeof children === 'function' ? children({
        values
      }) : children
    });
  }

  // Auto-render from fields prop
  if (fields && Array.isArray(fields)) {
    return /*#__PURE__*/_jsx(GatewayFormContext.Provider, {
      value: contextValue,
      children: /*#__PURE__*/_jsx("div", {
        className: "gty-controlled-form",
        children: fields.map(fieldConfig => {
          if (!fieldConfig.name || !fieldConfig.type) return null;
          if (fieldConfig.hidden) return null;
          return /*#__PURE__*/_jsx(ControlledFieldRenderer, {
            config: fieldConfig
          }, fieldConfig.name);
        })
      })
    });
  }

  // Nothing to render — just provide context for externally-rendered fields
  return /*#__PURE__*/_jsx(GatewayFormContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx("div", {
      className: "gty-controlled-form"
    })
  });
};
export { ControlledForm };