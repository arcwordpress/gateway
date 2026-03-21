# View Support Plugin — Architecture Analysis

## Architecture: Admin Builder → Code Generation → Runtime

The app is a **pipeline** with three layers:

```
React Admin UI (Raptor)
   ↓  writes via REST API
Raptor DB layer  ←── stores view config in DB (RaptorView, RaptorFacet, etc.)
   ↓  on every save: ViewRoutes calls RaptorBuilder::build()
FileFromData::generateViewClass()  ←── writes PHP class into generated plugin's lib/Views/
   ↓  generated plugin boots in WordPress
lib/View.php + ViewRegistry  ←── generated class extends \Gateway\View, calls ::register()
   ↓
Render strategies (Shortcode / Block / Template / Page)  ←── deliver to frontend
```

### Layer 1 — Raptor (admin + DB)

| File | Role |
|---|---|
| `lib/Raptor/Collections/RaptorView.php` | Eloquent model → `gateway_raptor_view` |
| `lib/Raptor/Collections/RaptorFacetList.php` | Bridge → `gateway_raptor_facet_list` |
| `lib/Raptor/Collections/RaptorFacet.php` | Individual facet → `gateway_raptor_facet` |
| `lib/Raptor/Collections/RaptorViewRender.php` | Render record → `gateway_raptor_view_render` |
| `lib/Raptor/Controllers/FacetController.php` | Facet CRUD including `getOrCreateFacetList()` |
| `lib/Raptor/Endpoints/FacetRoutes.php` | REST: GET/POST/PATCH/DELETE facets |
| `lib/Raptor/Endpoints/ViewRoutes.php` | REST: full view CRUD + preview |
| `lib/Raptor/Endpoints/ViewRenderRoutes.php` | REST: render engine management |
| `lib/Raptor/Build/RaptorBuilder.php` | Reads DB → calls `FileFromData` generators |

### Layer 2 — Code Generation

`RaptorBuilder::buildView()` reads a `RaptorView` (including its `RaptorFacet` rows) and calls `FileFromData::generateViewClass()` to write a PHP class into the generated plugin.

| File | Role |
|---|---|
| `lib/Views/FileFromData.php` | Writes `lib/Views/{ClassName}.php` into the generated plugin |
| `templates/scaffold/view_class.php` | Template for the generated PHP View class |
| `templates/scaffold/page_class.php` | Template for the optional Page wrapper (when `engine=page`) |

### Layer 3 — Runtime

The generated PHP View class (in the extension plugin) extends `\Gateway\View` and registers itself at WordPress boot. Render strategies use the registry to deliver the view to the frontend.

| File | Role |
|---|---|
| `lib/View.php` | Abstract base: `$key`, `$source`, `$columns`, `$facets`, `$defaultSort`, `$perPage` |
| `lib/Views/ViewRegistry.php` | Runtime registry, fires `gateway_view_registered` |
| `lib/Views/Facets/Facet.php` | Abstract facet base: `$key`, `$field`, `$label`, `$type`, `$config` |
| `lib/Views/Facets/FacetRegistry.php` | Runtime facet registry |
| `lib/Views/Render/Shortcode/`, `Block/`, `Template/`, `Page/` | Concrete render strategies |
| `lib/Views/ViewRoutes.php` | `GET /gateway/v1/views`, `/views/{key}`, `/views/renders` |

---

## Database Schema (Raptor layer)

```
gateway_raptor_view
  id, view_key (unique), view_list_id, title, description, status,
  sort_order, source, columns (JSON), default_sort (JSON), per_page
  [facet_filters longtext — orphan column, unused, left in DB]

gateway_raptor_facet_list
  id, view_id   ← 1:1 with RaptorView

gateway_raptor_facet
  id, facet_list_id, label, field_name, facet_type, config (JSON), sort_order

gateway_raptor_view_render
  id, view_id, engine, js_type
```

---

## UI Alignment Assessment

### Working end-to-end

| Feature | API | React UI |
|---|---|---|
| View CRUD | ✅ | ✅ |
| View list with drag-drop reorder | ✅ | ✅ dnd-kit |
| Column selection | ✅ | ✅ |
| Per-page config | ✅ | ✅ |
| Facet add | ✅ | ✅ |
| Facet delete | ✅ | ✅ |
| Facets written into generated PHP class via `RaptorBuilder` | ✅ | ✅ |
| Render strategy selection | ✅ | ✅ |
| JS type (react / preact / wpia) | ✅ | ✅ |
| Live view preview with real records | ✅ | ✅ |
| Auto-save with 800ms debounce | N/A | ✅ |

### Remaining gaps

| Gap | Where | Detail |
|---|---|---|
| **Facet edit/update** | UI | `FacetsNode.tsx` add+delete only; API has `PATCH /facets/{id}` but no edit form in UI |
| **Facet reorder** | Both | `sort_order` exists and API accepts it, but no reorder UI or batch-reorder endpoint |
| **Facet `config` not surfaced** | UI | `RaptorFacet.config` exists in DB and API, but `FacetsNode.tsx` never sends it; type-specific config (min/max for `range`, option list for `select`) has no UI entry point |
| **Facets not wired into `view-store.js`** | JS | `loadRecords()` only passes `per_page`+`page`; active facet filter values are never forwarded to the data API |
| **`default_sort` not exposed in UI** | UI | DB column and API field exist, no UI to configure |
| **`status` not exposed in ViewDesign** | UI | Settable via API but not surfaced in the design panel |
| **FacetController ownership not verified** | PHP | `FacetController::find($id)` returns any facet; `FacetRoutes` checks the view exists but never verifies the facet belongs to that view — cross-view deletion is possible |
| **`field_name` not validated against collection schema** | PHP | Plain string, no FK to field list |
| **`ViewRenderer.php` is deprecated** | PHP | Marked for elimination at top of file |

---

## Facet Ownership vs. Reuse

Facets are correctly **view-owned** in the DB:
```
RaptorView (1) → (1) RaptorFacetList (1) → (N) RaptorFacet
```

This is the right design — a facet on `event_date` only makes sense for a view sourced from a collection that has that field.

For reuse across views on the same collection, the least-invasive path is a **"Duplicate View"** action (clone view + its facets). A dedicated facet template system is a longer-term option if the `config` field gets richer usage.

---

## Key Source Locations

```
React admin
├── react/apps/raptor/src/pages/Views.tsx               View builder page
├── react/apps/raptor/src/pages/ViewDesign.tsx           Design canvas (facets, renders, columns)
├── react/apps/raptor/src/pages/Views/ViewsEditor.tsx    CRUD list + edit/delete forms
├── react/apps/raptor/src/pages/Views/ViewsPageContext.tsx  React context for view state
├── react/apps/raptor/src/components/graph_node_types/
│   ├── FacetsNode.tsx          Add/delete facets (no edit, no reorder, no config)
│   ├── ViewPreviewNode.tsx     Live data table preview
│   ├── RenderStrategyNode.tsx  Engine + JS type picker
│   └── RenderOutputNode.tsx    Generated code snippets
└── react/apps/raptor/src/lib/object_types/index.ts     View / Facet / ViewRender types

PHP / backend
├── lib/View.php                          $facets, getFacets() — runtime base class
├── lib/Raptor/Collections/RaptorView.php
├── lib/Raptor/Collections/RaptorFacetList.php
├── lib/Raptor/Collections/RaptorFacet.php
├── lib/Raptor/Controllers/FacetController.php
├── lib/Raptor/Endpoints/FacetRoutes.php
├── lib/Raptor/Endpoints/ViewRoutes.php
├── lib/Raptor/Build/RaptorBuilder.php    buildFacetsArray() → reads RaptorFacet rows
└── lib/Raptor/store/view-store.js        WP Interactivity store (facet filtering: TODO)
```
