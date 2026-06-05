# Exta Builder Field Configuration: Forms Package Analysis

## Purpose

Analysis of how Exta Builder could use `@arcwp/gateway-forms` field components for its field configuration UI, where storage is JSON (not API records). The goal is render-only fields with an external watch/onChange — no automatic saving. This document assesses current support, identifies gaps, and plans changes aligned with the pending `BlockForm` work.

---

## 1. Exta Builder: Current State

### How It Works Today

The builder app lives at `react/apps/exta/`. When a user configures fields for a collection, the flow is:

1. **FieldsEditor** (`pages/FieldsEditor.js`) loads a collection from context, extracts `fields` array into local state
2. **FieldEditor** (`components/FieldEditor.js`) renders each field as a row with three inputs: type (dropdown), label (text), name (text)
3. Changes call `onUpdate(index, fieldName, value)` which updates the `fields` array in state
4. On blur (or explicit save button), the entire collection JSON is `PUT` to the extensions API

### What's Missing

The current `FieldEditor` only edits the three universal properties (type, label, name). It does **not** expose type-specific configuration — a select field's `options`, a number field's `min`/`max`, a text field's `placeholder`, `required`, `help`, `instructions`, etc.

These type-specific settings are exactly the kind of fields that `@arcwp/gateway-forms` already knows how to render. The vision: when a user selects field type "select", a configuration panel appears using gateway-forms field components to edit `options`, `placeholder`, `required`, etc.

### Current Usage of gateway-forms

`FieldEditor.js:1` imports only `getRegisteredFieldTypes` to populate the type dropdown. No field rendering components are used.

### JSON Storage Shape

Fields are stored as objects in a `fields` array on the collection:

```javascript
{
  key: 'tickets',
  fields: [
    { type: 'text', name: 'title', label: 'Title', required: true, placeholder: 'Enter title' },
    { type: 'select', name: 'status', label: 'Status', options: [{ value: 'open', label: 'Open' }] },
    { type: 'number', name: 'priority', label: 'Priority', min: 1, max: 5 }
  ]
}
```

Changes to this JSON are saved via `PUT` to the extensions API endpoint. The builder owns saving — the forms package should not.

---

## 2. What Exta Needs from the Forms Package

### The Use Case

Render gateway-forms field components to edit field configuration values, where:

- **Values come from** a plain JS object (the field config being edited)
- **Changes flow to** a callback like `onChange(fieldName, value)` — no API, no `setAttributes`
- **No automatic saving** — Exta manages its own save timing (on blur / debounced / explicit button)
- **Watch function** — Exta wants to observe value changes to update its own state

### Concrete Example

When editing a "select" field type's configuration, Exta would render:

```jsx
// Hypothetical usage
<ControlledForm
  values={{ placeholder: 'Pick one', required: false, options: [...] }}
  onChange={(name, value) => updateFieldConfig(index, name, value)}
>
  <TextField config={{ name: 'placeholder', label: 'Placeholder', type: 'text' }} />
  <CheckboxField config={{ name: 'required', label: 'Required', type: 'checkbox' }} />
  {/* type-specific fields for options editor, etc. */}
</ControlledForm>
```

---

## 3. Can the Current Forms Package Support This?

### Short Answer: Partially, but with significant friction.

### What Works

1. **Field type registry** — All 27 field types are registered and their `Input` components can be retrieved via `useFieldType(config)` or `getFieldTypeInput(type)`.

2. **`createGatewayFormContext` with custom register** — The context factory already accepts a `customRegister` parameter (`gatewayFormContext.js:24`), and `createFieldRegister` (`fieldRegistration.js:24-101`) wraps any `(name, value) => void` function into the `{ name, onChange, onBlur, ref }` shape that field components expect.

3. **`GutenbergFieldProvider`** already demonstrates this pattern — it creates context with a custom register and no RHF, no collection, no API.

### What Doesn't Work

#### Problem 1: Many field types depend on `watch()` and `setValue()` from context

This is the **critical blocker**. A large number of field types call `watch(name)` and `setValue(name, value)` directly from `useGatewayForm()`:

| Field Type | Uses `watch()` | Uses `setValue()` |
|------------|:-:|:-:|
| text, email, url, password, textarea, number | No | No |
| select, radio, hidden | No | No |
| checkbox | No | No |
| **color-picker** | **Yes** | **Yes** |
| **range** | **Yes** | **Yes** |
| **button-group** | **Yes** | **Yes** |
| **slug** | **Yes** | **Yes** |
| **wysiwyg** | **Yes** | **Yes** |
| **markdown** | **Yes** | **Yes** |
| **file** | **Yes** | **Yes** |
| **image** | **Yes** | **Yes** |
| **gallery** | **Yes** | **Yes** |
| **link** | **Yes** | **Yes** |
| **oembed** | **Yes** | **Yes** |
| **date-picker** | **Yes** | **Yes** |
| **datetime-picker** | **Yes** | **Yes** |
| **time-picker** | **Yes** | **Yes** |
| **user** | **Yes** | **Yes** |
| **post-object** | **Yes** | **Yes** |
| **readonly** | **Yes** | No |
| **relation** | No | No |

**18 of 27 field types** use `watch()` and/or `setValue()`. In the current `GutenbergFieldProvider`, these are `undefined` because `methods` is `null`:

```javascript
// gatewayFormContext.js:44-45
setValue: methods?.setValue,   // undefined when methods is null
watch: methods?.watch,         // undefined when methods is null
```

Any field type that calls `watch(name)` on `undefined` will crash. This means the existing Gutenberg adapter only works for the ~9 simple field types that only use `register()`.

#### Problem 2: No mechanism to feed current values into the context

In React Hook Form, `watch(name)` returns the current value because RHF holds internal state. In a controlled (non-RHF) context, there needs to be a way to supply current values so that `watch(name)` returns the right thing. The current context has no `values` concept.

#### Problem 3: `GutenbergFieldProvider` is hardcoded to `setAttributes`

Its register function is `(name, value) => setAttributes({ [name]: value })`. For Exta, we need a generic `(name, value) => onChange(name, value)` pattern. While `createGutenbergRegister` could technically be used with any setter function, the naming and mental model tie it to Gutenberg.

---

## 4. Proposed Solution: A Unified `ControlledForm` Abstraction

Rather than creating separate wrappers for each use case (`BlockForm` for Gutenberg, another for Exta, etc.), the core need is the same: **render fields with values from props, notify on change, no automatic API saving**.

### 4.1 Rename / Generalize the Concept

The `BlockForm` proposed in the previous analysis and the form wrapper Exta needs are fundamentally the same thing:

| Aspect | BlockForm (Gutenberg) | Exta Builder Need |
|--------|----------------------|-------------------|
| Values source | `attributes` object | field config object |
| Change handler | `setAttributes({ [name]: value })` | `onChange(name, value)` |
| Saving | None (Gutenberg handles it) | None (Exta handles it) |
| Validation | Optional | Optional |
| Watch | Need current values accessible | Need current values accessible |

**Recommendation:** Build one component — call it `ControlledForm` — that both `BlockForm` and Exta can use. `BlockForm` becomes a thin wrapper that maps Gutenberg props to `ControlledForm` props.

### 4.2 `ControlledForm` API

```jsx
<ControlledForm
  values={{ title: 'Hello', layout: 'grid', columns: 3 }}
  onChange={(name, value) => { /* called on every field change */ }}
  fields={[                    // optional: for auto-rendering
    { type: 'text', name: 'title', label: 'Title' },
    { type: 'select', name: 'layout', label: 'Layout', options: [...] },
  ]}
  validate={false}             // optional: enable Zod validation
>
  {/* Option A: auto-render if no children */}
  {/* Option B: children rendered inside context */}
</ControlledForm>
```

### 4.3 Core Requirement: Mock `watch()` and `setValue()`

The `ControlledForm` must provide `watch` and `setValue` implementations in the context that work without React Hook Form.

```javascript
// Proposed: in ControlledForm or a new utility

const createControlledMethods = (values, onChange) => ({
  // watch(name) returns current value from the values object
  watch: (name) => {
    if (name === undefined) return values;          // watch() — all values
    if (typeof name === 'string') return values[name]; // watch('fieldName')
    // watch with callback not supported in controlled mode
  },

  // setValue(name, value) calls the onChange handler
  setValue: (name, value, options) => {
    onChange(name, value);
  },

  // getValues works like watch but is a snapshot
  getValues: (name) => {
    if (name === undefined) return { ...values };
    return values[name];
  },

  // register still works via createFieldRegister
  register: null, // set separately via createFieldRegister

  // Stubs for methods field types might call
  trigger: () => Promise.resolve(true),
  clearErrors: () => {},
  setError: () => {},
  handleSubmit: (fn) => (e) => { e?.preventDefault(); fn(values); },
  reset: () => {},
  control: null,

  // formState
  formState: createMockFormState({}),
});
```

This is the **key change** — `createGatewayFormContext` currently receives the full RHF `methods` object and spreads its properties. For controlled mode, we provide a compatible shim.

### 4.4 Component Hierarchy

```
ControlledForm (new)
  ├── Creates controlled methods shim (watch, setValue, register, etc.)
  ├── Calls createGatewayFormContext(controlledMethods, ...)
  ├── Provides GatewayFormContext
  └── Renders children or auto-renders fields

BlockForm (new, thin wrapper)
  └── ControlledForm
        values={attributes}
        onChange={(name, value) => setAttributes({ [name]: value })}

Exta Builder usage:
  └── ControlledForm
        values={fieldConfig}
        onChange={(name, value) => updateFieldConfig(index, name, value)}
```

---

## 5. Detailed Gap Analysis

### Changes Needed in `gatewayFormContext.js`

Currently `createGatewayFormContext` receives `methods` (RHF) or `null`, and spreads individual properties:

```javascript
// Current: gatewayFormContext.js:37-50
return {
  register,
  formState,
  setValue: methods?.setValue,    // undefined if no RHF
  getValues: methods?.getValues,  // undefined if no RHF
  watch: methods?.watch,          // undefined if no RHF — CRASH for 18 field types
  control: methods?.control,
  handleSubmit: methods?.handleSubmit,
  reset: methods?.reset,
  trigger: methods?.trigger,
  clearErrors: methods?.clearErrors,
  setError: methods?.setError,
  ...
};
```

**Required change:** Accept a `controlledMethods` object that provides `watch`, `setValue`, `getValues` as working implementations (not `undefined`). This can be done by:

- Option A: Allow `methods` to be a controlled shim object (duck-typing — if it has `watch`, use it)
- Option B: Add a new parameter `controlledMethods` that overrides individual properties
- **Recommended: Option A** — if the `methods` object has `watch`/`setValue`, use them. This way `ControlledForm` creates the shim and passes it as `methods`, and `createGatewayFormContext` works unchanged.

### Changes Needed in `fieldRegistration.js`

`createFieldRegister` already handles custom register functions. **No changes needed** — an Exta-style `(name, value) => onChange(name, value)` already works through the custom register path.

The existing `createGutenbergRegister` can be generalized:

```javascript
// Current:
export const createGutenbergRegister = (setAttributes) => {
  return (name, value) => { setAttributes({ [name]: value }); };
};

// Could add a generic version:
export const createControlledRegister = (onChange) => {
  return (name, value) => { onChange(name, value); };
};
```

Or Exta/BlockForm simply passes `(name, value) => onChange(name, value)` directly — `createFieldRegister` handles it.

### New File: `ControlledForm.js`

New form wrapper component at `react/packages/forms/src/components/form-types/ControlledForm.js`.

Responsibilities:
1. Accept `values`, `onChange`, optional `fields`, optional `validate`
2. Create controlled methods shim with working `watch()`, `setValue()`
3. Create register function via `createFieldRegister`
4. Provide `GatewayFormContext`
5. Optionally render fields automatically
6. Re-render fields when `values` prop changes (critical: must keep `watch()` return values current)

### New File: `BlockForm.js` (thin wrapper)

```javascript
const BlockForm = ({ attributes, setAttributes, fields, children, ...props }) => (
  <ControlledForm
    values={attributes}
    onChange={(name, value) => setAttributes({ [name]: value })}
    fields={fields}
    {...props}
  >
    {children}
  </ControlledForm>
);
```

### `watch()` Reactivity Challenge

The hardest part: in RHF, `watch(name)` is reactive — it causes re-renders when the value changes. In controlled mode, `watch(name)` is just `values[name]`, which is reactive **if the `values` prop changes** (causing `ControlledForm` to re-render and recreate the context).

This works naturally because:
1. Field onChange fires → calls `ControlledForm.onChange` prop → parent updates state → new `values` prop → `ControlledForm` re-renders → new context value with updated `watch`

For field types that call `watch()` to read their own current value (e.g., color-picker, wysiwyg), this flow is correct: the parent state update triggers a re-render, and `watch(name)` returns the new value.

For the **callback form** of `watch` (used by slug field: `watch((allValues, { name }) => { ... })`), controlled mode would need to support subscriptions. The slug field is an edge case — it watches another field. For the initial implementation, we could either:
- Document this limitation
- Implement a simple subscription system using `useEffect` in `ControlledForm`

### Index Exports

Add to `react/packages/forms/src/index.js`:

```javascript
export { ControlledForm } from './components/form-types/ControlledForm';
export { BlockForm } from './components/form-types/BlockForm';
```

---

## 6. Exta Builder Integration Plan

### Phase 1: Use `ControlledForm` for Field Config Editing

When a user expands a field row to edit its configuration:

```jsx
import { ControlledForm } from '@arcwp/gateway-forms';

// In FieldEditor or a new FieldConfigPanel component:
<ControlledForm
  values={field}  // { type: 'select', name: 'status', options: [...], required: false }
  onChange={(configKey, value) => onUpdate(index, configKey, value)}
>
  {/* Common config fields */}
  <TextField config={{ type: 'text', name: 'placeholder', label: 'Placeholder' }} />
  <CheckboxField config={{ type: 'checkbox', name: 'required', label: 'Required' }} />
  <TextField config={{ type: 'text', name: 'help', label: 'Help Text' }} />
  <TextareaField config={{ type: 'textarea', name: 'instructions', label: 'Instructions' }} />

  {/* Type-specific config — conditionally rendered */}
  {field.type === 'number' && <>
    <NumberField config={{ type: 'number', name: 'min', label: 'Minimum' }} />
    <NumberField config={{ type: 'number', name: 'max', label: 'Maximum' }} />
  </>}
  {field.type === 'select' && <>
    {/* Options editor — may need a custom component */}
  </>}
</ControlledForm>
```

### Phase 2: Per-Type Config Schemas

Each field type's `defaultConfig` already defines the type-specific configuration properties. This can be used to auto-generate the config editing UI:

```javascript
// From the registry:
const def = getFieldTypeDefinition('select');
// def.defaultConfig = { options: [], placeholder: 'Select an option' }

// Could generate config fields automatically from defaultConfig shape
```

This is a future enhancement — Phase 1 would use manually defined config field layouts per type.

---

## 7. Summary: Changes Required

### New Files

| File | Description |
|------|-------------|
| `forms/src/components/form-types/ControlledForm.js` | Core controlled form wrapper — values from props, onChange callback, mock RHF methods |
| `forms/src/components/form-types/BlockForm.js` | Thin Gutenberg wrapper around ControlledForm |

### Modified Files

| File | Change |
|------|--------|
| `forms/src/index.js` | Export `ControlledForm` and `BlockForm` |
| `forms/src/utils/fieldRegistration.js` | Add `createControlledRegister(onChange)` (small addition alongside existing `createGutenbergRegister`) |

### Potentially Modified

| File | Change | Notes |
|------|--------|-------|
| `forms/src/utils/gatewayFormContext.js` | Ensure `createGatewayFormContext` works when `methods` is a controlled shim (likely works already if shim has the right shape) | Verify, may need no changes |

### No Changes Required

| File | Reason |
|------|--------|
| `Form.js` | Unchanged — API submit flow |
| `AppForm.js` | Unchanged — API auto-save flow |
| All 27 field type components | Unchanged — they call `useGatewayForm()` which returns `watch`/`setValue` from whatever the wrapper provides |
| `services/api.js` | Not used by ControlledForm |
| `gutenbergFieldAdapter.js` | Remains for lower-level Gutenberg usage; `BlockForm` is the new higher-level option |
| `zodSchemaGenerator.js` | Could be enhanced later for field-config-only schemas, not required initially |

### Backward Compatibility

- `Form`, `AppForm` completely unchanged
- `GutenbergFieldProvider` / `GutenbergField` / `GutenbergFieldGroup` remain available
- All field type components unchanged — they work with any context provider
- Studio app unchanged
- Exta builder can adopt `ControlledForm` incrementally

### Key Insight: ControlledForm Serves Both Use Cases

The previous analysis proposed `BlockForm` for Gutenberg. This analysis reveals that Exta needs the same thing. Rather than building two wrappers, we build `ControlledForm` as the core primitive and `BlockForm` as a thin Gutenberg-specific wrapper. This keeps the architecture clean:

```
Form          — submit-based API saving (existing)
AppForm       — auto-save API saving (existing)
ControlledForm — render-only, values from props, onChange callback (new)
BlockForm     — ControlledForm + setAttributes mapping (new, thin wrapper)
```
