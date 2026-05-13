# ComposedForm — Custom Layout with Autosave

`ComposedForm` lets you place individual fields anywhere in your markup while still getting per-field autosave out of the box. Think of it like a ClickUp ticket editor: title at the top, description in the main area, due date and assignee in a sidebar — each field exactly where you want it, saving itself when changed.

---

## How It Works

`ComposedForm` is `AppForm` under the hood. It:

- Provides a React context that all fields read from
- Watches every field value via React Hook Form's `watch()`
- Debounces changes (300 ms) and PATCHes each field independently via the collection's REST endpoint
- Renders **only its children** — no automatic field loop

`useField(name)` is a hook you call inside any component rendered within a `<ComposedForm>`. It reads the field's type and config from the collection context, looks up the right Input/Display components from the field registry, and returns them pre-bound. Autosave happens automatically because the parent form watches all RHF-registered values.

---

## Quick Start

```jsx
import { ComposedForm, useField } from '@arcwp/gateway-forms';

function TicketForm({ ticketId }) {
  return (
    <ComposedForm collection="tickets" recordId={ticketId}>
      <TicketLayout />
    </ComposedForm>
  );
}

function TicketLayout() {
  const { Input: TitleField }    = useField('title');
  const { Input: StatusField }   = useField('status');
  const { Input: DueDateField }  = useField('due_date');
  const { Input: AssigneeField } = useField('assignee');
  const { Input: BodyField }     = useField('body');

  return (
    <div className="ticket">
      <div className="ticket__header">
        <TitleField />
        <StatusField />
      </div>

      <div className="ticket__body">
        <BodyField />
      </div>

      <aside className="ticket__sidebar">
        <DueDateField />
        <AssigneeField />
      </aside>
    </div>
  );
}
```

Fields save themselves on change — no submit button needed.

---

## API

### `<ComposedForm>`

Identical props to `<AppForm>`:

| Prop | Type | Required | Description |
|---|---|---|---|
| `collection` | `string \| object` | Yes | Collection key string, or a pre-loaded collection object |
| `recordId` | `number` | Yes (for autosave) | The record to edit. Without this, the form renders but does not save |
| `apiAuth` | `object` | No | Auth object forwarded to API calls |
| `onFieldUpdate` | `function(fieldName, value, response)` | No | Called after each successful field save |
| `onFieldError` | `function(fieldName, value, message)` | No | Called when a field save fails |
| `onLoad` | `function(collection, data)` | No | Called once after collection + record load |
| `onSave` | `function(formValues)` | No | Called on every form change with a full snapshot (before the debounce fires) |
| `children` | `ReactNode` | Yes | Your layout — fields go here |

---

### `useField(name, configOverride?)`

Must be called inside a component rendered within `<ComposedForm>` or `<AppForm>`.

```js
const { Input, Display } = useField(name, configOverride);
```

| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Field name matching the collection schema |
| `configOverride` | `object` | Optional. Merged on top of the collection config. Should be a stable reference (see below) |

**Returns `{ Input, Display }`**

- `Input` — Full field component with label, help icon, and input control. Drop it anywhere.
- `Display` — Read-only formatted display of the value. Useful for preview modes.

Both components accept an optional `config` prop at render time for one-off overrides:

```jsx
<DueDateField config={{ placeholder: 'Pick a sprint end date' }} />
```

---

## Patterns

### Config overrides

Define overrides **outside** the render function (or `useMemo` them) to keep the hook's memoization stable. Inline object literals create a new reference on every render and cause unnecessary re-renders.

```jsx
// Good — stable reference
const dueDateConfig = { label: 'Sprint End Date' };

function TicketLayout() {
  const { Input: DueDateField } = useField('due_date', dueDateConfig);
  return <DueDateField />;
}
```

```jsx
// Also fine — memoized inside the component
function TicketLayout() {
  const dueDateConfig = useMemo(() => ({ label: 'Sprint End Date' }), []);
  const { Input: DueDateField } = useField('due_date', dueDateConfig);
  return <DueDateField />;
}
```

### Display mode (read-only)

```jsx
function TicketSummary({ ticketId }) {
  return (
    <ComposedForm collection="tickets" recordId={ticketId}>
      <TicketDisplay />
    </ComposedForm>
  );
}

function TicketDisplay() {
  const { Display: TitleDisplay }   = useField('title');
  const { Display: StatusDisplay }  = useField('status');
  const { Display: DueDateDisplay } = useField('due_date');

  return (
    <dl>
      <dt>Title</dt>  <dd><TitleDisplay /></dd>
      <dt>Status</dt> <dd><StatusDisplay /></dd>
      <dt>Due</dt>    <dd><DueDateDisplay /></dd>
    </dl>
  );
}
```

### Reacting to saves

```jsx
<ComposedForm
  collection="tickets"
  recordId={ticketId}
  onFieldUpdate={(fieldName, value) => {
    toast.success(`${fieldName} saved`);
  }}
  onFieldError={(fieldName, value, message) => {
    toast.error(`Failed to save ${fieldName}: ${message}`);
  }}
>
  <TicketLayout />
</ComposedForm>
```

### Inline collection object (no network fetch)

If you already have the collection definition, pass it directly to skip the fetch:

```jsx
import ticketsCollection from './collections/tickets.json';

<ComposedForm collection={ticketsCollection} recordId={ticketId}>
  <TicketLayout />
</ComposedForm>
```

### Mixing composed fields with custom controls

`useField` handles fields defined in the collection schema. For one-off UI elements that aren't schema fields, you can drop in any React component alongside the composed fields — they coexist without conflict.

```jsx
function TicketLayout() {
  const { Input: TitleField } = useField('title');

  return (
    <div>
      <TitleField />
      <button onClick={handleArchive}>Archive</button>  {/* not a field, that's fine */}
    </div>
  );
}
```

---

## Relationship to Existing Components

| Component | Autosave | Field placement |
|---|---|---|
| `Form` | No | Automatic loop over all collection fields |
| `AppForm` | Yes | Children only — you place fields manually |
| `ComposedForm` | Yes | Same as AppForm — this is AppForm |
| `ControlledForm` | No | Auto-loop or children |

`ComposedForm` is the right choice when you need autosave **and** a custom layout. If you just need autosave with the default field loop, use `AppForm` directly (or `Form` with a submit handler).

---

## Autosave Behaviour

- Changes debounce for **300 ms** per field before sending
- Each field saves independently — changing the title doesn't block saving the due date
- Fields track `isUpdating` state (accessible via `useGatewayFormField(name)`) so you can show per-field saving spinners
- If a save fails, the error surfaces in `fieldErrors` via context and is passed to `onFieldError`
- The form skips autosave if `recordId` is missing or the collection has no REST endpoint
