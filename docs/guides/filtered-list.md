# Building a Custom Filtered List

A minimal, code-only pattern for rendering a TanStack Table of Gateway collection records with a single-select facet filter — without using the black-box `Grid` component.

---

## Packages involved

| Package | Role |
|---|---|
| `@arcwp/gateway-data` | Fetch collection metadata and records |
| `@arcwp/gateway-grids` | Table view, filter components, column generation, filter logic |
| `@tanstack/react-table` | Table instance (peer dep, already bundled) |

---

## Minimal working example

```jsx
import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'
import { CollectionProvider, useCollectionInfo, useCollectionRecords } from '@arcwp/gateway-data'
import {
  TableView,
  SelectFilter,
  generateColumns,
  applyFilters,
  extractUniqueValues,
} from '@arcwp/gateway-grids'

// Inner component — sits inside CollectionProvider
function FilteredList() {
  const { collection, collectionLoading } = useCollectionInfo()
  const { records, recordsLoading }       = useCollectionRecords()
  const [filterValues, setFilterValues]   = useState({})

  const facet = {
    field: 'status',      // field name on each record
    type:  'select',
    label: 'Status',
  }

  const choices = useMemo(
    () => extractUniqueValues(records, facet.field),
    [records]
  )

  const filtered = useMemo(
    () => applyFilters(records, [facet], filterValues),
    [records, filterValues]
  )

  const columns = useMemo(
    () => (collection ? generateColumns(collection) : []),
    [collection]
  )

  const table = useReactTable({
    data:            filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (collectionLoading || recordsLoading) return <p>Loading…</p>

  return (
    <div>
      <SelectFilter
        label={facet.label}
        choices={choices}
        value={filterValues[facet.field] ?? ''}
        onChange={(v) => setFilterValues((prev) => ({ ...prev, [facet.field]: v }))}
      />
      <TableView table={table} data={filtered} columns={columns} loading={false} />
    </div>
  )
}

// Outer component — provides collection context
export default function MyPage() {
  return (
    <CollectionProvider collectionKey="tickets">
      <FilteredList />
    </CollectionProvider>
  )
}
```

---

## How the pieces connect

```
CollectionProvider (gateway-data)
  └─ fetches metadata  →  collection object  →  generateColumns()  →  columns[]
  └─ fetches records   →  records[]
                              └─ extractUniqueValues()  →  choices[]  →  <SelectFilter>
                              └─ applyFilters()         →  filtered[]
                                                               └─ useReactTable()
                                                                      └─ <TableView>
```

`filterValues` is a plain object `{ [fieldName]: value }`. `applyFilters` is AND logic — every active filter must pass. An empty string or `null` value means "no filter applied" for that field.

---

## Hardcoding your own facet vs using collection metadata

The example above defines `facet` inline. If the collection has `grid.facets` configured on the backend, you can drive the filter from that instead:

```js
const facets = collection?.grid?.facets ?? []
// facets[0] = { field: 'status', type: 'select', label: 'Status', choices: [...] }
```

`extractUniqueValues(records, field)` auto-builds `choices` from live data when the backend hasn't pre-populated them.

---

## Adding more column control

`generateColumns(collection)` auto-generates columns from `collection.fields` or `collection.grid.columns`. To override entirely, pass raw TanStack column defs:

```js
const columns = [
  { accessorKey: 'id',     header: 'ID' },
  { accessorKey: 'title',  header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
]
```

---

## Skipping CollectionProvider (direct API)

If you already have records from somewhere else, skip the provider and call the API directly:

```js
import { collectionApi } from '@arcwp/gateway-data'

const meta    = await collectionApi.fetchCollection('tickets')
const result  = await collectionApi.fetchRecords(
  meta.routes.find(r => r.type === 'get_many').namespace,
  meta.routes.find(r => r.type === 'get_many').path
)
const records = result.data.items
```

---

## Current gaps in the packages

These are things you will hit and that should be addressed in the packages:

### Missing until recently (now fixed)
`generateColumns`, `applyFilters`, `extractUniqueValues` were internal to `Grid` and not exported. They are now exported from `@arcwp/gateway-grids`.

### Still missing / rough edges

**`GridLayout` is not truly composable.**
Despite the name, `GridLayout` is just `Grid` with static properties attached. It still owns all data fetching internally. You cannot pass `table` or `data` into it. The guide above bypasses it entirely in favour of direct primitives.

**No `useTableSetup()` hook.**
The TanStack boilerplate (`useReactTable` + sort state + pagination state) is repeated everywhere. A thin `useTableSetup(columns, data, options?)` hook in `@arcwp/gateway-grids` would clean this up.

**No `useFilterState(facets)` hook.**
Managing `filterValues` state and wiring `onChange` per-facet is manual. A hook that returns `{ values, setValue, reset }` keyed by field name would make multi-facet setups less repetitive.

**`TableView` does not accept an external `table` instance.**
Currently `TableView` expects to receive a pre-built TanStack table object. This works fine, but there is no lower-level escape hatch if you need access to the raw table instance from outside (e.g. for imperative reset). This is acceptable for now.

**`SelectFilter.choices` shape.**
`extractUniqueValues` returns `[{ value, label }]`. `SelectFilter` expects the same shape. This is consistent but undocumented — worth adding a type or JSDoc.

**`CollectionProvider` skips PK normalisation.**
The `Grid` component normalises records so every record has a lowercase `id` equal to its actual primary key (needed for WP core collections like `wp_post` which use `ID`). `CollectionProvider` does not do this. If your collection uses a non-standard primary key, add the normalisation step yourself after fetching:

```js
const pk      = collection.primaryKey || 'id'
const records = raw.map(r => pk === 'id' ? r : { id: r[pk], ...r })
```
