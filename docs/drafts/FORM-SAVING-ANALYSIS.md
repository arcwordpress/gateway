# Form Saving Analysis: `@arcwp/gateway-forms`

## Purpose

Analysis of how form saving works in the `gateway-forms` package, how field values are parsed before saving, what is handled in the package versus in consuming code, and a plan for enabling these fields to work as Gutenberg block inspector controls saving to attributes — without disrupting existing use cases.

---

## 1. Current Architecture Overview

The forms package (`react/packages/forms/`) provides two form wrapper components, a field type registry with 27 field types, and a context system that wires field components to a data persistence strategy.

### Key Architectural Layers

```
┌─────────────────────────────────────────────────────┐
│  Form Wrapper (Form / AppForm)                      │
│  - Owns the persistence strategy (API calls)        │
│  - Owns React Hook Form instance                    │
│  - Provides GatewayFormContext                       │
├─────────────────────────────────────────────────────┤
│  GatewayFormContext                                  │
│  - register(), formState, setValue, watch, etc.      │
│  - collection metadata, fieldErrors, updatingFields  │
├─────────────────────────────────────────────────────┤
│  Field Components (27 types)                        │
│  - Call useGatewayForm() to get register + state    │
│  - Are agnostic to HOW data is persisted            │
│  - Render via Field wrapper (label, help, errors)   │
└─────────────────────────────────────────────────────┘
```

The critical insight: **field components don't save data themselves**. They call `register(fieldName)` from context, which returns `{ name, onChange, onBlur, ref }` props. The form wrapper decides what `register` actually does — whether it binds to React Hook Form (for API saving) or to `setAttributes` (for Gutenberg).

---

## 2. How Saving Works Today

### 2.1 `Form` Component — Submit-Based Saving

**File:** `react/packages/forms/src/components/form-types/Form.js`

The `Form` component implements traditional submit-based persistence:

1. **Load collection metadata** from API via `getCollection(collectionKey)` (line 65-79)
2. **Load existing record** (if `recordId` provided) via `getRecord(endpoint, recordId)` (line 81-104)
3. **On submit**, collect all field values from React Hook Form, validate against Zod schema, then call API:
   - **Create mode:** `POST` to `collection.routes.endpoint` (line 123)
   - **Edit mode:** `PUT` to `collection.routes.endpoint/{id}` (line 120)

```javascript
// Form.js:106-134
const onSubmit = async (data) => {
  const endpoint = collection?.routes?.endpoint;
  if (isEditMode && recordId) {
    response = await updateRecord(endpoint, recordId, data, { auth: apiAuth });
  } else {
    response = await createRecord(endpoint, data, { auth: apiAuth });
  }
};
```

**Props:** `collectionKey`, `recordId`, `apiAuth`

### 2.2 `AppForm` Component — Auto-Save Per Field

**File:** `react/packages/forms/src/components/form-types/AppForm.js`

The `AppForm` component implements debounced per-field auto-saving:

1. **Watches all field values** via React Hook Form's `watch()` (line 82)
2. **Detects changes** by comparing to `previousValuesRef` (line 118-140)
3. **Debounces** each field change by 300ms (line 137-139)
4. **Saves individual field** via `PUT` to `collection.routes.endpoint/{id}` with `{ [fieldName]: value }` (line 196-239)

```javascript
// AppForm.js:196-215
const updateField = async (fieldName, value) => {
  setUpdatingFields(prev => ({ ...prev, [fieldName]: true }));
  const updateData = { [fieldName]: value };
  const response = await updateRecord(endpoint, recordId, updateData, { auth: apiAuth });
  if (onFieldUpdate) onFieldUpdate(fieldName, value, response);
};
```

**Props:** `collection` (string key or object), `recordId`, `apiAuth`, `onFieldUpdate`, `onFieldError`, `onLoad`, `onSave`, `children`

The `onSave` callback fires on every form values change (line 102-108), which is a synchronous notification — it does not control saving.

### 2.3 API Service Layer

**File:** `react/packages/forms/src/services/api.js`

Internal (not exported) service wrapping `@arcwp/gateway-data`:

| Function | HTTP Method | Endpoint |
|----------|-------------|----------|
| `getCollection(key)` | via `collectionApi.fetchCollection` | Collection metadata endpoint |
| `getRecord(endpoint, id)` | `GET` | `{endpoint}/{id}` |
| `createRecord(endpoint, data)` | `POST` | `{endpoint}` |
| `updateRecord(endpoint, id, data)` | `PUT` | `{endpoint}/{id}` |

The endpoint comes from `collection.routes.endpoint` in the collection metadata returned by the API. This is always a REST API URL.

---

## 3. How Field Values Are Parsed

### 3.1 Zod Schema Generation

**File:** `react/packages/forms/src/utils/zodSchemaGenerator.js`

`generateZodSchema(collection)` builds a Zod schema from collection metadata. This serves dual purposes: **validation** and **type coercion**.

Type mapping:

| Field Type / Cast | Zod Schema | Coercion |
|-------------------|------------|----------|
| `checkbox` / `boolean` cast | `z.boolean()` | None |
| `number` / `integer` cast | `z.coerce.number().int()` | String → Number |
| `float`/`double`/`decimal` cast | `z.coerce.number()` | String → Number |
| `datetime`/`date` cast | `z.string().datetime().or(z.date())` | None |
| `email` | `z.string().email().or(z.literal(''))` | None |
| `url` | `z.string().url().or(z.literal(''))` | None |
| `file` / `image` | `z.coerce.number().int().positive()` | String → Number (attachment ID) |
| `gallery` | `z.string()` | None (JSON string) |
| `relation` | `z.coerce.number().int().positive()` | String → Number (FK) |
| `select`/`radio`/`textarea`/`wysiwyg`/`color`/`markdown` | `z.string()` | None |
| Default | `z.string()` | None |

Additional validation rules applied from field config: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `options` (enum).

### 3.2 Parsing in Practice

- **Form component:** Zod schema is used as the `zodResolver` for React Hook Form (Form.js:47). Validation + coercion runs on submit.
- **AppForm component:** Zod schema is set with `mode: 'onChange'` (AppForm.js:78). Validation runs on each change, but the raw watched value is what gets sent to the API — coercion is mainly for validation feedback.
- **Neither component** does additional parsing/transformation of values before sending to the API. The data that React Hook Form collects from inputs is sent as-is (after Zod validation).

---

## 4. What Is Handled in the Package vs. in Config/Usage

### Handled Entirely in the Package

- Collection metadata fetching and parsing
- Record loading and form population
- Zod schema generation from collection metadata
- React Hook Form setup and configuration
- Field rendering via the field type registry
- API calls for create/update (via internal `services/api.js`)
- Auto-save debouncing logic (AppForm)
- Field error and updating state management
- The GatewayFormContext provider

### Handled in Consuming Code (e.g., Studio)

Very little. The studio app's `CollectionForm.js` is minimal:

```javascript
// react/apps/studio/src/pages/CollectionForm.js
<Form collectionKey={collectionKey} recordId={id} />
```

The consumer provides:
- `collectionKey` (from URL params)
- `recordId` (from URL params)
- Optionally `apiAuth` for authentication
- Page layout/chrome around the form

**The package is highly self-contained.** The API endpoint, field definitions, validation rules, and save behavior are all derived from collection metadata fetched from the API. The consumer has almost no control over the saving mechanism.

---

## 5. Existing Gutenberg Integration

The package already has a Gutenberg adapter layer:

**File:** `react/packages/forms/src/adapters/gutenbergFieldAdapter.js`

### What Exists

- `GutenbergFieldProvider` — wraps children with `GatewayFormContext` using `createGutenbergRegister(setAttributes)` instead of React Hook Form
- `GutenbergField` — renders a single field within the provider
- `GutenbergFieldGroup` — batch renders multiple fields
- `useGutenbergField` / `useGutenbergFieldWithContext` — hooks for flexible usage

### How It Works

```javascript
// gutenbergFieldAdapter.js:32-58
export const GutenbergFieldProvider = ({ attributes, setAttributes, children }) => {
  const gutenbergRegister = useMemo(
    () => createGutenbergRegister(setAttributes),
    [setAttributes]
  );
  const contextValue = useMemo(
    () => createGatewayFormContext(
      null,              // no RHF methods
      null,              // no collection
      null,              // no recordId
      false,             // not loading
      null,              // no error
      {}, {},            // no fieldErrors/updatingFields
      gutenbergRegister  // custom register function
    ),
    [gutenbergRegister]
  );
  return (
    <GatewayFormContext.Provider value={contextValue}>
      {children}
    </GatewayFormContext.Provider>
  );
};
```

### Field Registration Abstraction

**File:** `react/packages/forms/src/utils/fieldRegistration.js`

`createFieldRegister(registerFn)` detects whether it's given React Hook Form's `register` or a custom function:
- If RHF: returns it as-is (line 28-45)
- If custom (e.g., Gutenberg): wraps it to extract values from events and call `registerFn(name, value)` (line 53-101)

`createGutenbergRegister(setAttributes)` returns `(name, value) => setAttributes({ [name]: value })` (line 142-146)

### Current Limitations

The existing Gutenberg adapter is **field-level only**. It provides context so fields can save to attributes via `setAttributes`, but:

1. **No form-level wrapper** analogous to `Form` or `AppForm` — no `BlockForm` component
2. **No collection metadata integration** — field configs must be passed manually
3. **No validation** — Zod schema generation requires a collection, which is `null`
4. **No loading/error states** — context passes `false`/`null` for these
5. **No auto-save orchestration** — each field independently calls `setAttributes`
6. **Field components still render with full Field wrapper** (label, help, instructions, errors) which may not match Gutenberg inspector control styling

---

## 6. Plan: `BlockForm` Component for Gutenberg Inspector Controls

### 6.1 Goals

1. Reuse existing field type components in Gutenberg block inspector controls
2. Save field values to block **attributes** instead of API
3. Support optional validation (Zod-based, same as existing)
4. Do NOT disrupt `Form` or `AppForm` behavior
5. Support other future persistence targets (e.g., custom post meta, options API)

### 6.2 Proposed Component: `BlockForm`

A new form wrapper component alongside `Form` and `AppForm`:

```
react/packages/forms/src/components/form-types/
├── Form.js          # Existing: submit-based API saving
├── AppForm.js       # Existing: auto-save API saving
└── BlockForm.js     # New: attribute-based saving for Gutenberg
```

#### Proposed API

```jsx
import { BlockForm } from '@arcwp/gateway-forms';

// In block edit function:
<InspectorControls>
  <BlockForm
    attributes={attributes}
    setAttributes={setAttributes}
    fields={[
      { type: 'text', name: 'title', label: 'Title', required: true },
      { type: 'select', name: 'layout', label: 'Layout', options: [...] },
      { type: 'number', name: 'columns', label: 'Columns', min: 1, max: 4 },
      { type: 'color', name: 'bgColor', label: 'Background Color' },
    ]}
    collection={optionalCollectionObject}  // optional: for validation/metadata
    validate={true}                         // optional: enable Zod validation
  >
    {/* Option A: auto-render all fields */}
    {/* Option B: custom layout with children */}
    {(fields) => (
      <PanelBody title="Layout">
        {fields.layout}
        {fields.columns}
      </PanelBody>
      <PanelBody title="Style">
        {fields.bgColor}
      </PanelBody>
    )}
  </BlockForm>
</InspectorControls>
```

#### Key Differences from Existing Wrappers

| Aspect | `Form` | `AppForm` | `BlockForm` (proposed) |
|--------|--------|-----------|----------------------|
| **Persistence target** | REST API | REST API | Block attributes |
| **Save trigger** | Submit button | Debounced per-field | Immediate via `setAttributes` |
| **Data source** | API collection metadata | API collection metadata | Props (field configs) or collection object |
| **Validation** | Zod on submit | Zod on change | Optional Zod on change |
| **React Hook Form** | Yes | Yes | Optional (lighter weight) |
| **Renders `<form>` tag** | Yes | No | No |
| **Loading state** | Yes (API fetch) | Yes (API fetch) | No (data from props) |
| **Record ID** | Yes | Yes | No (attributes are the record) |

### 6.3 Implementation Approach

#### What `BlockForm` Would Do

1. **Accept field configs as props** instead of fetching from API
2. **Create GatewayFormContext** with a Gutenberg-compatible register function (already implemented in `fieldRegistration.js`)
3. **Optionally integrate React Hook Form** for validation, or run in lightweight mode
4. **Render field components** using the existing field type registry
5. **Save via `setAttributes`** — every field change immediately calls `setAttributes({ [name]: value })`

#### Leveraging Existing Infrastructure

The package already has most of the pieces:

| Piece | Status | Notes |
|-------|--------|-------|
| `createGutenbergRegister(setAttributes)` | Exists | `fieldRegistration.js:142-146` |
| `createFieldRegister()` abstraction | Exists | `fieldRegistration.js:24-111` |
| `createGatewayFormContext()` with custom register | Exists | `gatewayFormContext.js:16-73` |
| `createMockFormState()` | Exists | `fieldRegistration.js:120-130` |
| `GutenbergFieldProvider` | Exists | `gutenbergFieldAdapter.js:32-59` |
| Field type registry + 27 field types | Exists | All use `useGatewayForm()` context |
| Zod schema from field configs (without collection) | Needs work | Currently requires `collection.fillable` |

#### What Needs to Be Built

1. **`BlockForm` component** — the new wrapper that:
   - Takes `attributes`, `setAttributes`, and `fields` as props
   - Builds context using existing `createGatewayFormContext` with `createGutenbergRegister`
   - Renders fields automatically or via render-prop children
   - Optionally wraps with React Hook Form for validation

2. **Extend `generateZodSchema`** to accept a plain fields array (not just a full collection object), or create a lighter schema builder for field-config-only usage

3. **Consider a lighter Field wrapper variant** for inspector controls — the current `Field` component renders labels, help icons, instructions, and error messages with `gty-` CSS classes. Inspector controls may need either:
   - A CSS override/theme for Gutenberg panel styling
   - A render mode prop on Field (e.g., `variant="inspector"`)
   - Or reliance on Gutenberg's own PanelRow/BaseControl wrappers

### 6.4 Open Questions and Considerations

#### Styling in Inspector Controls
Field components render with `gty-form__field` CSS classes. Inside Gutenberg's `InspectorControls` `<PanelBody>`, these may conflict or look wrong. Options:
- Add a `variant` or `context` prop to `Field` that switches CSS class prefix
- Use Gutenberg's `BaseControl` as the field wrapper when in block context
- Apply a CSS reset/override within `BlockForm`

#### Field Types That Depend on WordPress APIs
Some field types (`file`, `image`, `gallery`, `relation`, `user`, `post-object`) make API calls internally to fetch options or open the media library. These will work in Gutenberg (same WordPress context), but their saved values will be attribute IDs rather than API-persisted records. Consumers need to understand that `BlockForm` only handles the attribute storage — rendering/resolving those IDs on the frontend is the block's responsibility.

#### Validation Without a Collection Object
`generateZodSchema` currently requires a `collection` with `fillable` and `casts`. For `BlockForm` usage with plain field configs, we'd want a function like:

```javascript
generateZodSchemaFromFields(fields)
// where fields is an array of { name, type, required, min, max, ... }
```

This is a small refactor — extract the per-field schema logic from `generateZodSchema` into a shared function.

#### Render Prop vs. Auto-Render
`BlockForm` should support both:
- **Auto-render:** Pass `fields` array, renders all in order (like `GutenbergFieldGroup`)
- **Render prop / children:** For custom layouts with `PanelBody`, tabs, etc.

`AppForm` already supports `children` but doesn't provide field components to them. `BlockForm` could use a render-prop pattern:

```jsx
<BlockForm fields={fields} attributes={attributes} setAttributes={setAttributes}>
  {({ renderField, renderAll }) => (
    <PanelBody title="Settings">
      {renderField('title')}
      {renderField('layout')}
    </PanelBody>
  )}
</BlockForm>
```

### 6.5 Toward a General Persistence Abstraction

Looking beyond Gutenberg, other use cases might include:
- Saving to **custom post meta** (via `wp.data` dispatch)
- Saving to **WordPress options** (via REST API or `wp.data`)
- Saving to **local state** only (preview/ephemeral forms)
- Saving to **external APIs** (non-WordPress endpoints)

All of these share the same pattern: field components collect values, and a wrapper component decides where they go. The existing architecture supports this via `createFieldRegister` — any function with the signature `(name, value) => void` can be the persistence target.

A future direction could be a generic `FormProvider` that accepts a `saveStrategy` prop:

```jsx
<FormProvider saveStrategy={attributeStrategy(setAttributes)}>
<FormProvider saveStrategy={apiStrategy(endpoint, recordId)}>
<FormProvider saveStrategy={metaStrategy(postId)}>
```

But for now, a dedicated `BlockForm` is the pragmatic next step — it's clear, discoverable, and doesn't over-abstract.

---

## 7. Summary of Required Changes

### New Files
| File | Description |
|------|-------------|
| `react/packages/forms/src/components/form-types/BlockForm.js` | New form wrapper for Gutenberg attribute saving |

### Modified Files
| File | Change |
|------|--------|
| `react/packages/forms/src/index.js` | Export `BlockForm` |
| `react/packages/forms/src/utils/zodSchemaGenerator.js` | Extract per-field schema logic into reusable function; add `generateZodSchemaFromFields(fields)` |
| `react/packages/forms/src/components/field/index.js` | Consider adding `variant` prop for inspector-style rendering (optional) |

### No Changes Required
| File | Reason |
|------|--------|
| `Form.js` | Untouched — existing API-based submit flow |
| `AppForm.js` | Untouched — existing API-based auto-save flow |
| `services/api.js` | Not used by BlockForm |
| `fieldRegistration.js` | Already supports Gutenberg register |
| `gatewayFormContext.js` | Already supports custom register |
| `gutenbergFieldAdapter.js` | Existing adapter remains available for lower-level usage |
| All 27 field type components | Unchanged — they use `useGatewayForm()` which works with any context provider |

### Backward Compatibility

- `Form` and `AppForm` are completely unchanged
- `GutenbergFieldProvider`, `GutenbergField`, `GutenbergFieldGroup` remain as-is (they serve a different, lower-level use case)
- The field type registry and all field components are unchanged
- Studio app usage is unaffected
- `BlockForm` is a new export, not a replacement
