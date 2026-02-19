# Gateway Grid Block

The **Gateway Grid** block (`gateway/gateway-grid`) displays records from a registered Gateway collection. It is a monolithic block built to exercise the WordPress Interactivity API store pattern end-to-end before being decomposed into a tree of smaller child blocks.

## How it works

```
┌─────────────────────────────────────────────────┐
│  block.json   name: gateway/gateway-grid         │
│               attribute: collectionSlug (string) │
├──────────────────────┬──────────────────────────┤
│   index.js (editor)  │   view.js (frontend)      │
│   React state        │   Interactivity API store │
│   data / records     │   context.data / records  │
│   handleStatusFilter │   actions.filterByStatus  │
│   loadData()         │   callbacks.init          │
└──────────────────────┴──────────────────────────┘
```

### Store structure (view.js)

The store namespace is `gateway/gateway-grid`. All state is held in the Interactivity API per-block context (not global state), so multiple grid instances on the same page are fully independent.

| Context key     | Type    | Purpose |
|-----------------|---------|---------|
| `collectionSlug`| string  | Which Gateway collection to load |
| `data`          | array   | **Full dataset** from the API — never mutated by filters |
| `records`       | array   | **Filtered view** — what the grid renders |
| `statusFilter`  | string  | Currently active status filter value |
| `loading`       | boolean | `true` while a fetch is in progress |
| `error`         | string  | Set on fetch failure; `null` otherwise |

### Data flow

```
callbacks.init
  │  1. GET /wp-json/gateway/v1/collections/{slug}   ← resolve endpoint
  │  2. GET {endpoint}                               ← fetch all records
  │
  ├─▶ context.data    = allRecords   (full dataset)
  └─▶ context.records = allRecords   (initial view, no filter)

actions.filterByStatus(event)
  │  reads  context.data
  └─▶ context.records = data.filter(r => r.status === event.target.value)
```

`context.data` is the permanent source of truth. Filters only write to `context.records`. Clearing the filter (`value === ''`) resets `records` to a shallow copy of `data`.

### State getters

```js
state.loading        // context.loading
state.isNotLoading   // !context.loading  — used with data-wp-bind--hidden
state.error          // context.error
state.hasNoError     // !context.error    — used with data-wp-bind--hidden
state.isReady        // !loading && !error
state.data           // context.data
state.records        // context.records
state.totalCount     // context.data.length
state.filteredCount  // context.records.length
state.hasRecords     // context.records.length > 0
state.isFiltered     // !!context.statusFilter
```

### Authentication

Fetch requests pass `credentials: 'include'` (cookies) and, when `window.wpApiSettings.nonce` is present, an `X-WP-Nonce` header. This covers both public and cookie-authenticated REST endpoints.

For protected endpoints on pages without the WP REST API bootstrap script, pass the nonce through block context via `wp_interactivity_config()` in PHP rather than relying on the global.

---

## Editor preview

The editor `edit()` function replicates the store logic using React state:

| view.js              | edit() equivalent              |
|----------------------|--------------------------------|
| `context.data`       | `useState([])` — `data`        |
| `context.records`    | `useState([])` — `records`     |
| `callbacks.init`     | `loadData(slug)` via `useEffect` on `collectionSlug` |
| `actions.filterByStatus` | `handleStatusFilter(value)` |

Changing the **Collection** setting triggers `loadData` again, clears the active filter, and replaces `data`/`records` — the same effect as the frontend running `callbacks.init`. A **Refresh Records** button in the settings panel allows manual re-fetch without changing the collection.

The editor canvas renders the same `gateway-grid__*` CSS classes as the frontend, giving a pixel-accurate preview. A small `"Editor preview — live data"` badge distinguishes it from the saved output.

---

## Rendered fields

The current version renders three columns: **ID**, **Title**, **Status**.

These are assumed to be present on every record. They are hardcoded in both `save()` (via `data-wp-text` directives on `context.record.*`) and `edit()` (via JSX).

> **TODO:** Make the column list configurable via block attributes once the block is decomposed into child blocks (column, cell, header, …).

---

## Status filter options

Status values (`active`, `inactive`, `pending`, `draft`, `published`) are hardcoded in the `STATUS_OPTIONS` constant in `index.js` and in the `<option>` elements in `save()`.

> **TODO:** Derive status options dynamically from either:
> - `collectionInfo.fields.status.options` (field enum from collection definition)
> - `Array.from(new Set(data.map(r => r.status)))` computed in `callbacks.init` after data loads
>
> No changes to the store's `filterByStatus` action are needed — it already compares against whatever string the `<select>` emits.

---

## File map

```
react/block-types/src/blocks/gateway-grid/
├── block.json      Block metadata (name, attributes, style/script refs)
├── index.js        Editor component (edit + save)
├── view.js         Interactivity API store (frontend)
├── editor.css      Editor-only styles (badge)
└── style.css       Shared frontend + editor styles (gateway-grid__* classes)
```

---

## Related

- [Grid Column Configuration](../grid-configuration.md) — defining `$grid` columns on a PHP Collection class
- [Collection REST routes](../COLLECTION-REFERENCE.md) — how collection endpoints are registered
- `lib/Collections/CollectionRoutes.php` — PHP class that registers the REST routes the store fetches from
- `react/packages/data` — Gateway data package (React-side collection helpers; not used by view.js directly — the store uses plain `fetch` for Interactivity API compatibility)
