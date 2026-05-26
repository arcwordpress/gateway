# Building a Custom Filtered List

A minimal, code-only pattern for rendering a TanStack Table of Gateway collection records with facet filters — without using the black-box `Grid` component.

---

## Packages involved

| Package | Role |
|---|---|
| `@arcwp/gateway-data` | Fetch collection metadata and records |
| `@arcwp/gateway-grids` | Table view, filter panel, column generation, filter logic |
| `@tanstack/react-table` | Table instance (peer dep, already bundled) |

---

## Facets from collection metadata (recommended)

If your collection has `grid.facets` defined on the backend, the filter panel drives itself. `GridLayout.Facets` reads the facet configs, auto-extracts select choices from live records, renders every filter type, and updates state — all you supply is one `useState({})`.

```jsx
import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'
import { CollectionProvider, useCollectionInfo, useCollectionRecords } from '@arcwp/gateway-data'
import { GridLayout, TableView, generateColumns, applyFilters } from '@arcwp/gateway-grids'

function FilteredList() {
  const { collection, collectionLoading } = useCollectionInfo()
  const { records, recordsLoading }       = useCollectionRecords()
  const [filterValues, setFilterValues]   = useState({})

  const facets   = collection?.grid?.facets ?? []
  const filtered = useMemo(() => applyFilters(records, facets, filterValues), [records, facets, filterValues])
  const columns  = useMemo(() => collection ? generateColumns(collection) : [], [collection])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (collectionLoading || recordsLoading) return <p>Loading…</p>

  return (
    <div>
      {/* Renders all configured facets automatically, auto-populates select choices */}
      <GridLayout.Facets
        filters={facets}
        values={filterValues}
        onChange={setFilterValues}
        data={records}
        isOpen={true}
      />
      <TableView table={table} data={filtered} columns={columns} loading={false} />
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

## Single hardcoded filter (no collection metadata)

If the collection has no `grid.facets` config, or you want a filter that isn't in the metadata, render a single filter component directly:

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

`applyFilters` works the same either way — pass the inline facet definition alongside `filterValues`:

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
                                                      └──→  useReactTable  →  <TableView>
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
The four lines of TanStack boilerplate (`useReactTable` + row models) repeat at every callsite. A thin hook in `@arcwp/gateway-grids` wrapping the common configuration would reduce this.

**`TableView` does not expose the table instance externally.**
If you need imperative control (e.g. reset sort from outside) there is no ref or callback for the internal table instance. This is rarely needed for simple filtered lists.
