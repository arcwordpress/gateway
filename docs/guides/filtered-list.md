# Building a Custom Filtered List

A complete guide for rendering a table of Gateway collection records with facet filters on a WordPress front-end page. Assumes your collection is already set up and working in Gateway.

---

## 1. Scaffold the Vite app

From your extension root, create the app inside `apps/`:

```bash
mkdir -p apps
cd apps
npm create vite@latest front -- --template react
```

This creates `apps/front/`. Before running `npm install`, add the Gateway packages to `apps/front/package.json`. They are referenced by file path because they are not yet published to npm — Gateway and your extension both live in `plugins/`, so from `apps/front/` the path is typically:

```json
{
  "dependencies": {
    "@arcwp/gateway-data":  "file:../../../gateway/react/packages/data",
    "@arcwp/gateway-grids": "file:../../../gateway/react/packages/grids"
  }
}
```

Adjust `../../../gateway` if your directory layout differs — it must point to the Gateway plugin root. From `apps/front/` that is: `front` → `apps` → your extension → `plugins/` → `gateway`.

Now install:

```bash
cd front
npm install
```

---

## 2. Configure Vite

`ReactAppController` (used in step 7) looks for `dist/index.js` by name. Replace the default `vite.config.js` to output predictable filenames:

```js
// apps/front/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Pin all react imports to this app's own copies.
    // Gateway packages are linked via file: into gateway/react/ which has
    // its own node_modules/react — without explicit aliases, react/jsx-runtime
    // and react can resolve to different installations giving a null dispatcher.
    alias: {
      'react': resolve('./node_modules/react'),
      'react-dom': resolve('./node_modules/react-dom'),
      'react/jsx-runtime': resolve('./node_modules/react/jsx-runtime'),
    },
  },
  build: {
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.[ext]',
      },
    },
  },
})
```

---

## 3. Write FilteredList.jsx

This is the component that fetches collection data, applies filters, and renders the table. Create `src/FilteredList.jsx`:

```jsx
// src/FilteredList.jsx
import { useState, useMemo } from 'react'
import { useCollectionInfo, useCollectionRecords } from '@arcwp/gateway-data'
import { GridLayout, TableView, generateColumns, applyFilters } from '@arcwp/gateway-grids'

export default function FilteredList() {
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
```

**What each piece does:**
- `useCollectionInfo` — fetches collection metadata including `grid.facets` config from the backend
- `useCollectionRecords` — fetches the full record list
- `generateColumns` — builds TanStack column definitions from collection metadata
- `GridLayout.Facets` — reads the facet config, auto-extracts choices from live records, renders all filters, and calls `setFilterValues` on change. If `grid.facets` is empty, nothing renders.
- `applyFilters` — filters the record array client-side based on current filter state
- `TableView` — renders a sortable, paginated TanStack table; takes `data` and `columns`, manages its own table instance internally

`GridLayout.Facets` calls `setFilterValues` with a functional update internally, so passing the setter directly is correct. Reset all filters with `setFilterValues({})`.

---

## 4. Write App.jsx

`CollectionProvider` wraps the tree and makes `useCollectionInfo` and `useCollectionRecords` work. Create `src/App.jsx`:

```jsx
// src/App.jsx
import { CollectionProvider } from '@arcwp/gateway-data'
import FilteredList from './FilteredList'

export default function App() {
  return (
    <CollectionProvider collectionKey="hats">
      <FilteredList />
    </CollectionProvider>
  )
}
```

Replace `"hats"` with your collection key.

---

## 5. Write main.jsx

The entry point reads the config that WordPress injects and configures the API client before mounting. Replace the generated `src/main.jsx`:

```jsx
// src/main.jsx
import { createRoot } from 'react-dom/client'
import { getApiClient } from '@arcwp/gateway-data'
import App from './App'

const config = window.hatsConfig ?? {}

const client = getApiClient()
client.defaults.baseURL  = config.apiUrl ?? '/wp-json/'
client.defaults.headers.common['X-WP-Nonce'] = config.nonce ?? ''

const root = document.getElementById('hats-app')
if (root) {
  createRoot(root).render(<App />)
}
```

`window.hatsConfig` is injected by WordPress in step 7. Once configured here, every `CollectionProvider` and `collectionApi` call sends the nonce automatically — no further auth setup needed in components.

---

## 6. Build

```bash
# from apps/front/
npm run build
```

Confirm `apps/front/dist/index.js` exists before continuing.

---

## 7. Create the app shell template

WordPress needs a PHP template file to render when the route is visited. Create `templates/app-shell.php` in your extension root:

```php
<?php
// templates/app-shell.php
get_header(); ?>

<div id="hats-app"></div>

<?php get_footer();
```

The `id="hats-app"` must match the `document.getElementById` call in `main.jsx`.

---

## 8. Register the WordPress route

`ReactAppController` handles rewrite rules, template loading, and asset enqueueing in one call. Put this wherever your extension bootstraps (e.g. after `gateway_loaded`):

```php
\Gateway\Apps\ReactAppController::register([
    'basePath'     => 'hats',
    'buildDir'     => plugin_dir_path(__FILE__) . 'apps/front/dist/',
    'buildUrl'     => plugin_dir_url(__FILE__)  . 'apps/front/dist/',
    'templateFile' => plugin_dir_path(__FILE__) . 'templates/app-shell.php',
    'localizeKey'  => 'hatsConfig',
    'localizeData' => fn() => [
        'apiUrl' => rest_url(),
        'nonce'  => wp_create_nonce('wp_rest'),
    ],
]);
```

`basePath` sets the URL slug. Visiting `yoursite.com/hats` loads the template and enqueues the build. No WordPress page needs to exist in the database.

`localizeData` provides `window.hatsConfig` to `main.jsx`. The nonce must be generated at request time (inside a callable, as shown) so it is always fresh.

After registering for the first time, flush rewrite rules — visit Settings → Permalinks, or call `flush_rewrite_rules()` in your plugin activation hook.

---

## 9. Verify

Visit `yoursite.com/hats`. You should see your theme header/footer with the filtered table rendered inside. If the page is blank, check:

1. Build output — `apps/front/dist/index.js` exists
2. Paths — `buildDir` and `buildUrl` both point to the same build folder
3. Rewrite rules — have been flushed since registration
4. Nonce — browser network tab shows `X-WP-Nonce` on REST requests

---

## Row click / navigation

`TableView` accepts an optional `onRowClick` prop:

```jsx
<TableView
  data={filtered}
  columns={columns}
  loading={false}
  onRowClick={(record) => { window.location.href = `/hats/${record.id}` }}
/>
```

Rows with `onRowClick` get the `table-view__row--clickable` CSS class.

---

## Filters without collection metadata

If your collection has no `grid.facets` config, or you need a filter not covered by the metadata, render a filter component directly inside `FilteredList`:

```jsx
import { SelectFilter, extractUniqueValues } from '@arcwp/gateway-grids'

// inside FilteredList, before the return:
const choices = useMemo(() => extractUniqueValues(records, 'status'), [records])

// in the JSX:
<SelectFilter
  label="Status"
  choices={choices}
  value={filterValues.status ?? ''}
  onChange={(v) => setFilterValues(prev => ({ ...prev, status: v }))}
/>
```

Pass a manual facet definition to `applyFilters`:

```js
const facets   = [{ field: 'status', type: 'select', label: 'Status' }]
const filtered = applyFilters(records, facets, filterValues)
```

---

## How the pieces connect

```
ReactAppController::register(['basePath' => 'hats', ...])
  ├─ rewrite rule        →  yoursite.com/hats  matches
  ├─ template_include    →  templates/app-shell.php  →  <div id="hats-app">
  ├─ wp_enqueue_scripts  →  dist/index.js
  └─ wp_localize_script  →  window.hatsConfig { apiUrl, nonce }
                                      │
                             main.jsx reads config, configures axios
                                      │
                             <CollectionProvider collectionKey="hats">
                               ├─ metadata  →  grid.facets  →  GridLayout.Facets
                               └─ records   →  applyFilters(records, facets, filterValues)
                                                                  └──→  <TableView>
```

---

## Skipping CollectionProvider (direct API)

If you prefer to fetch data manually:

```js
import { collectionApi } from '@arcwp/gateway-data'

const meta    = await collectionApi.fetchCollection('hats')
const route   = meta.routes.find(r => r.type === 'get_many')
const result  = await collectionApi.fetchRecords(route.namespace, route.path)
const records = result.data.items
```

---

## Known gaps

**`GridLayout` is not truly composable.** Despite the name, `GridLayout` owns its own data fetching internally. Use the sub-components (`GridLayout.Facets`, etc.) directly as shown above — do not render `<GridLayout>` itself.

**No external table control.** `TableView` manages sorting and pagination state internally. If you need server-side pagination or external sort control, you would need to build the table manually with `useReactTable` from `@tanstack/react-table`.
