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
import { GatewayFormContext, createGatewayFormContext } from '../../utils/gatewayFormContext';
import { createControlledRegister, createMockFormState } from '../../utils/fieldRegistration';
import { generateZodSchema, generateZodSchemaFromFields } from '../../utils/zodSchemaGenerator';
import { useFieldType } from '../../fieldTypeRegistry';

/**
 * Build a methods-compatible shim that satisfies the interface field components
 * expect from useGatewayForm() — specifically watch(), setValue(), getValues().
 *
 * This shim is passed as the `methods` parameter to createGatewayFormContext so
 * that every context property (watch, setValue, getValues, formState, etc.) is a
 * working function rather than undefined.
 */
const createControlledMethods = (valuesRef, onChange, errors) => {
  // watch(name?) — returns current value(s) synchronously.
  // Supports: watch() → all values, watch('name') → single value.
  // The callback subscription form (used by slug field) is stubbed to a no-op
  // unsubscribe; ControlledForm re-renders on every values change which
  // achieves the same reactive result for the vast majority of field types.
  const watch = (nameOrCallback) => {
    if (typeof nameOrCallback === 'function') {
      // Subscription form — return unsubscribe no-op.
      // The component will still re-render because values prop changes.
      return { unsubscribe: () => {} };
    }
    if (nameOrCallback === undefined) {
      return { ...valuesRef.current };
    }
    return valuesRef.current[nameOrCallback];
  };

  const setValue = (name, value, _options) => {
    onChange(name, value);
  };

  const getValues = (name) => {
    if (name === undefined) {
      return { ...valuesRef.current };
    }
    return valuesRef.current[name];
  };

  return {
    // These are consumed directly by createGatewayFormContext
    register: null,  // will be overridden by customRegister path
    formState: createMockFormState(errors || {}),
    setValue,
    getValues,
    watch,
    control: null,
    handleSubmit: (fn) => (e) => { e?.preventDefault?.(); fn(valuesRef.current); },
    reset: () => {},
    trigger: () => Promise.resolve(true),
    clearErrors: () => {},
    setError: () => {},
  };
};

/** Auto-renders a single field from config, reading Input from the registry. */
const ControlledFieldRenderer = ({ config }) => {
  const { Input } = useFieldType(config);
  return <Input config={config} />;
};

const ControlledForm = ({
  values = {},
  onChange,
  fields,
  validate = false,
  collection = null,
  children,
}) => {
  // Keep a ref that is always current so watch() inside the shim reads fresh values
  // without needing to recreate the methods object on every render.
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Stable onChange wrapper
  const onChangeStable = useCallback(
    (name, value) => {
      if (typeof onChange === 'function') {
        onChange(name, value);
      }
    },
    [onChange]
  );

  // Optional validation schema
  const validationSchema = useMemo(() => {
    if (!validate) return null;
    if (collection) return generateZodSchema(collection);
    if (fields && Array.isArray(fields)) return generateZodSchemaFromFields(fields);
    return null;
  }, [validate, collection, fields]);

  // TODO: wire up live validation errors from validationSchema when validate=true.
  // For now we pass an empty errors object.
  const errors = {};

  const controlledRegister = useMemo(
    () => createControlledRegister(onChangeStable),
    [onChangeStable]
  );

  const controlledMethods = useMemo(
    () => createControlledMethods(valuesRef, onChangeStable, errors),
    // valuesRef.current is always up-to-date so watch() reads fresh values
    // without needing to recreate the methods object on every render.
    [onChangeStable]
  );

  const contextValue = useMemo(
    () => createGatewayFormContext(
      controlledMethods, // methods shim with watch/setValue/getValues
      collection,        // may be null — that's fine
      null,              // no recordId
      false,             // not loading
      null,              // no error
      {},                // no fieldErrors
      {},                // no updatingFields
      controlledRegister // custom register for the onChange pathway
    ),
    [controlledMethods, collection, controlledRegister]
  );

  // When children are provided, render them inside context (custom layout).
  if (children) {
    return (
      <GatewayFormContext.Provider value={contextValue}>
        {typeof children === 'function' ? children({ values }) : children}
      </GatewayFormContext.Provider>
    );
  }

  // Auto-render from fields prop
  if (fields && Array.isArray(fields)) {
    return (
      <GatewayFormContext.Provider value={contextValue}>
        <div className="gty-controlled-form">
          {fields.map((fieldConfig) => {
            if (!fieldConfig.name || !fieldConfig.type) return null;
            if (fieldConfig.hidden) return null;
            return (
              <ControlledFieldRenderer key={fieldConfig.name} config={fieldConfig} />
            );
          })}
        </div>
      </GatewayFormContext.Provider>
    );
  }

  // Nothing to render — just provide context for externally-rendered fields
  return (
    <GatewayFormContext.Provider value={contextValue}>
      <div className="gty-controlled-form" />
    </GatewayFormContext.Provider>
  );
};

export { ControlledForm };
