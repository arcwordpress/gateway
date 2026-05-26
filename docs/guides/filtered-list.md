# Building a Custom Filtered List

This guide covers everything from registering the WordPress route through to rendering a filtered table of Gateway collection records. It assumes your collection is already set up and working in Gateway.

---

## 1. Scaffold the Vite app

From your extension root, create the app inside `apps/`:

```bash
mkdir -p apps
cd apps
npm create vite@latest front -- --template react
cd front
npm install
```

This creates `apps/front/` with a standard Vite + React project. The `--template react` flag sets up JSX; use `react-ts` if you prefer TypeScript.

Add the Gateway packages as workspace dependencies in `apps/front/package.json`:

```json
{
  "dependencies": {
    "@arcwp/gateway-data":  "*",
    "@arcwp/gateway-grids": "*"
  }
}
```

These are workspace packages inside the Gateway monorepo (`react/packages/`). For this to resolve, your extension must be part of the same npm workspace — add it to the root `package.json` workspaces array, then run `npm install` from the workspace root.

---

## 2. Vite config

`ReactAppController` looks for `build/index.js` and `build/index.css` by name (it uses `filemtime()` for cache-busting, so no manifest is needed). Replace the default `vite.config.js` to output predictable filenames:

```js
// apps/front/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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

Build output goes to `apps/front/build/` (Vite's default `outDir`). Adjust `build.outDir` if you want it elsewhere — keep it in sync with `buildDir`/`buildUrl` in the PHP registration below.

---

## 3. React entry point

Replace the generated `src/main.jsx` to read the WordPress-injected config and configure the API client before rendering:

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

From here, `CollectionProvider` and `collectionApi` will automatically send the nonce header on every request. No further auth configuration is needed in your components.

---

## 4. The React app

Create `src/App.jsx`:

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

The `FilteredList` component is covered in the sections below. Once you have a basic version in place, run the build:

```bash
# from apps/front/
npm run build
```

Verify `apps/front/build/index.js` exists before wiring up WordPress.

---

## 5. Register the route

With a working build in place, wire it into WordPress. `ReactAppController` handles rewrite rules, template override, and asset enqueuing — in one call. Put this wherever your extension bootstraps (e.g. after `gateway_loaded`):

```php
\Gateway\Apps\ReactAppController::register([
    'basePath'     => 'hats',
    'buildDir'     => plugin_dir_path(__FILE__) . 'apps/front/build/',
    'buildUrl'     => plugin_dir_url(__FILE__)  . 'apps/front/build/',
    'templateFile' => plugin_dir_path(__FILE__) . 'templates/app-shell.php',
    'localizeKey'  => 'hatsConfig',
    'localizeData' => fn() => [
        'apiUrl' => rest_url(),
        'nonce'  => wp_create_nonce('wp_rest'),
    ],
]);
```

`basePath` is the URL slug — visiting `yoursite.com/hats` (or any sub-path under it) will load your template and enqueue your build. No WP page needs to exist in the database.

After registering for the first time, flush rewrite rules once — either by visiting Settings → Permalinks or calling `flush_rewrite_rules()` in your activation hook.

---

## 6. Create the app shell template

`templateFile` points to a plain PHP file. All it needs is the mount div wrapped in the theme shell:

```php
<?php
// templates/app-shell.php
get_header(); ?>

<div id="hats-app"></div>

<?php get_footer();
```

Visit `yoursite.com/hats` — you should see the default Vite React output inside your theme. From here, replace the app content with the filtered list pattern below.

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

`GridLayout.Facets` calls `setFilterValues` with a functional update internally, so passing the setter directly is all that is needed. Resetting all filters is `setFilterValues({})`.

---

## Row click / navigation

`TableView` accepts an optional `onRowClick` prop that receives the full record object:

```jsx
<TableView
  data={filtered}
  columns={columns}
  loading={false}
  onRowClick={(record) => window.location.href = `/hats/${record.id}`}
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
ReactAppController::register(['basePath' => 'hats', ...])
  └─ rewrite rule          →  yoursite.com/hats  matches
  └─ template_include      →  templates/app-shell.php  →  <div id="hats-app">
  └─ wp_enqueue_scripts    →  build/index.js + build/index.css
  └─ wp_localize_script    →  window.hatsConfig { apiUrl, nonce }
                                        │
                               main.jsx reads config, sets axios headers
                                        │
                               CollectionProvider (collectionKey="hats")
                                 ├─ metadata  →  facets  →  GridLayout.Facets  ─┐
                                 │                                               │ filterValues
                                 └─ records   →  applyFilters  →  filtered[]    │
                                                                        └──→  <TableView>
```

---

## Skipping CollectionProvider (direct API)

```js
import { collectionApi } from '@arcwp/gateway-data'

const meta    = await collectionApi.fetchCollection('hats')
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
