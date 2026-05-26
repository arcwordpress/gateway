# Building a Custom Filtered List

A minimal, code-only pattern for rendering a table of Gateway collection records with facet filters — without using the black-box `Grid` component.

---

## Packages involved

| Package | Role |
|---|---|
| `@arcwp/gateway-data` | Fetch collection metadata and records |
| `@arcwp/gateway-grids` | Table view, filter panel, column generation, filter logic |

---

## Facets from collection metadata (recommended)

If your collection has `grid.facets` defined on the backend, the filter panel drives itself. `GridLayout.Facets` reads the facet configs, auto-extracts select choices from live records, renders every filter type, and updates state — all you supply is one `useState({})`.

`TableView` creates the TanStack table instance internally; you pass `data` and `columns`.

```jsx
import { useState, useMemo } from 'react'
import { CollectionProvider, useCollectionInfo, useCollectionRecords } from '@arcwp/gateway-data'
import { GridLayout, TableView, generateColumns, applyFilters } from '@arcwp/gateway-grids'

function FilteredList() {
  const { collection, collectionLoading } = useCollectionInfo()
  const { records, recordsLoading }       = useCollectionRecords()
  const [filterValues, setFilterValues]   = useState({})

  const facets   = collection?.grid?.facets ?? []
  const columns  = useMemo(() => collection ? generateColumns(collection) : [], [collection])
  const filtered = useMemo(() => applyFilters(records, facets, filterValues), [records, facets, filterValues])

  if (collectionLoading || recordsLoading) return <p>Loading…</p>

  return (
    <div>
      <GridLayout.Facets
        filters={facets}
        values={filterValues}
        onChange={setFilterValues}
        data={records}
        isOpen={true}
      />
      <TableView data={filtered} columns={columns} loading={false} />
    </div>
  )
}

export default function MyPage() {
  return (
    <CollectionProvider collectionKey="tickets">
      <FilteredList />
    </CollectionProvider>
  )
}
```

`GridLayout.Facets` calls `setFilterValues` with a functional update internally, so passing the setter directly is all that is needed. Resetting all filters is `setFilterValues({})`.

---

## Row click / navigation

`TableView` accepts an optional `onRowClick` prop that receives the full record object:

```jsx
<TableView
  data={filtered}
  columns={columns}
  loading={false}
  onRowClick={(record) => navigate(`/tickets/${record.id}`)}
/>
```

Rows with `onRowClick` receive the `table-view__row--clickable` CSS class so you can style the cursor.

---

## Single hardcoded filter (no collection metadata)

If the collection has no `grid.facets` config, or you want a filter not in the metadata, render a filter component directly:

```jsx
import { SelectFilter, extractUniqueValues } from '@arcwp/gateway-grids'

const choices = useMemo(() => extractUniqueValues(records, 'status'), [records])

<SelectFilter
  label="Status"
  choices={choices}
  value={filterValues.status ?? ''}
  onChange={(v) => setFilterValues(prev => ({ ...prev, status: v }))}
/>
```

`applyFilters` works the same — pass the inline facet definition:

```js
const facets   = [{ field: 'status', type: 'select', label: 'Status' }]
const filtered = applyFilters(records, facets, filterValues)
```

---

## How the pieces connect

```
CollectionProvider
  ├─ metadata  →  collection.grid.facets  →  GridLayout.Facets  ─┐
  │                                                               │ filterValues state
  │               applyFilters(records, facets, filterValues)  ←─┘
  └─ records   →─────────────────────────────────────────────→  filtered[]
                                                                      │
                   generateColumns(collection)  →  columns[]          │
                                                       └──→  <TableView data columns>
```

---

## Skipping CollectionProvider (direct API)

```js
import { collectionApi } from '@arcwp/gateway-data'

const meta    = await collectionApi.fetchCollection('tickets')
const route   = meta.routes.find(r => r.type === 'get_many')
const result  = await collectionApi.fetchRecords(route.namespace, route.path)
const records = result.data.items
```

---

## Current gaps in the packages

**`GridLayout` is not truly composable.**
Despite the name, `GridLayout` is `Grid` wrapped with static child properties. It still owns all data fetching internally. The sub-components (`GridLayout.Facets`, `GridLayout.Table`, etc.) are the useful exports — use them directly as shown above rather than rendering `<GridLayout>` itself.

**No `useTableSetup()` hook.**
`TableView` manages sorting and pagination state internally, which covers most cases. If you need to control those externally (e.g. server-side pagination), there is no escape hatch — you would need to build the table manually with `useReactTable` from `@tanstack/react-table` and render rows yourself.
