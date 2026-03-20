# View Support Plugin — Architecture Analysis

## Two Parallel View Systems

There are **two coexisting view systems** in the codebase:

### System A — PHP Class-Based (code-gen / legacy)

| File | Role |
|---|---|
| `lib/View.php` | Abstract base class: `$key`, `$source`, `$columns`, `$facetFilters`, `$defaultSort`, `$perPage` |
| `lib/Views/ViewRegistry.php` | Singleton registry, fires `gateway_view_registered` hook |
| `lib/Views/Facets/Facet.php` | Abstract facet base: `$key`, `$field`, `$label`, `$type`, `$config` |
| `lib/Views/Facets/FacetRegistry.php` | Singleton registry, fires `gateway_facet_registered` hook |
| `lib/Views/Render/` | Strategy pattern: Shortcode, Block, Template, Page |
| `lib/Views/FileFromData.php` | Scaffolds PHP View class files from data |
| `lib/Views/ViewRoutes.php` | `GET /gateway/v1/views`, `GET /gateway/v1/views/{key}`, `GET /gateway/v1/views/renders` |

Views are **code-generated PHP classes**. Facets exist as independently registered objects decoupled from any specific view.

### System B — Raptor / Database-Backed (React admin target)

| File | Role |
|---|---|
| `lib/Raptor/Collections/RaptorView.php` | Eloquent model → `gateway_raptor_view` |
| `lib/Raptor/Collections/RaptorFacetList.php` | Bridge table → `gateway_raptor_facet_list` |
| `lib/Raptor/Collections/RaptorFacet.php` | Individual facet → `gateway_raptor_facet` |
| `lib/Raptor/Collections/RaptorViewRender.php` | Render record → `gateway_raptor_view_render` |
| `lib/Raptor/Controllers/FacetController.php` | CRUD logic including `getOrCreateFacetList()` |
| `lib/Raptor/Endpoints/FacetRoutes.php` | REST routes: GET/POST/PATCH/DELETE for facets |
| `lib/Raptor/Endpoints/ViewRoutes.php` | REST routes: full CRUD + preview endpoint |
| `lib/Raptor/Endpoints/ViewRenderRoutes.php` | REST routes: render engine management |
| `lib/Raptor/store/view-store.js` | WP Interactivity API store (pagination, no facets yet) |
| `lib/Raptor/ViewRenderer.php` | **Deprecated** — marked for elimination |

The React admin (`react/apps/raptor`) targets **System B exclusively**.

---

## Database Schema (System B)

```
gateway_raptor_view
  id, view_key (unique), view_list_id, title, description, status,
  sort_order, source, columns (JSON), facet_filters (JSON), default_sort (JSON), per_page

gateway_raptor_facet_list
  id, view_id                          ← 1:1 with RaptorView

gateway_raptor_facet
  id, facet_list_id, label, field_name, facet_type, config (JSON), sort_order

gateway_raptor_view_render
  id, view_id, engine, js_type
```

Relationship chain: `RaptorView (1) → (1) RaptorFacetList (1) → (N) RaptorFacet`

---

## UI Alignment Assessment

### Working end-to-end

| Feature | PHP API | React UI |
|---|---|---|
| View CRUD (create / edit / delete) | ✅ | ✅ |
| View list with drag-drop reorder | ✅ | ✅ dnd-kit |
| Column selection (checkboxes) | ✅ | ✅ |
| Per-page config | ✅ | ✅ |
| Facet add | ✅ | ✅ |
| Facet delete | ✅ | ✅ |
| Render strategy selection (shortcode / block / template / page) | ✅ | ✅ |
| JS type selection (react / preact / wpia) | ✅ | ✅ |
| Live view preview with real records | ✅ | ✅ |
| Auto-save with debounce (800 ms) | N/A | ✅ |
| ReactFlow visual graph canvas | N/A | ✅ |

### Gaps and incomplete areas

| Gap | Where | Detail |
|---|---|---|
| **Facet edit/update** | UI only | `FacetsNode.tsx` supports add + delete only. The API has `PATCH /facets/{id}` but there is no edit form in the UI. |
| **Facet reorder** | Both | `RaptorFacet.sort_order` exists and the API accepts it, but there is no reorder UI and no batch-reorder endpoint. |
| **`facet_filters` JSON field is an orphan** | DB + UI | `gateway_raptor_view.facet_filters` exists and is readable/writable via the view PATCH endpoint, but the UI never touches it and its relationship to the `RaptorFacet` table is undefined. Should be clarified or removed. |
| **Facets not wired into `view-store.js`** | JS | `loadRecords()` only passes `per_page` and `page` query params. Facet filter values from the user's UI interactions are never forwarded to the data API. |
| **`default_sort` not exposed in UI** | UI | The DB column and API field exist but there is no UI to configure sort order. |
| **`status` not exposed in ViewDesign** | UI | `View.status` is settable via API but invisible in the design panel (only the view list shows it). |
| **Facet `config` not surfaced** | UI | `RaptorFacet.config` (JSON) is accepted by the API but `FacetsNode.tsx` never sends it. Type-specific config (e.g., min/max for `range`, option list for `select`) has no UI entry point. |
| **FacetController ownership not verified** | PHP | `FacetController::find($id)` retrieves any facet by ID. `FacetRoutes` checks that the view exists but does **not** verify the facet belongs to that view — cross-view deletion is possible if an attacker guesses a facet ID. |
| **`field_name` not validated against collection schema** | PHP | Facets store a plain string `field_name` with no FK to the collection's fields. The API accepts any value. |
| **`ViewRenderer.php` is deprecated** | PHP | Top-of-file comment: "Marked for elimination — early experiment, deprecated in favor of View Renders." Shortcode handler is still registered but the class should be removed once View Renders covers all use cases. |

---

## Facet Architecture: View-Owned vs. Reusable

### Current design

Facets are **strongly owned by a specific view** via the DB chain. There is no cross-view sharing at any layer — the API routes are always scoped under `/view/{view_key}/facets`.

### The design tension

Facets reference a `field_name` that is only meaningful in the context of a specific collection. A `date_range` facet on `event_date` is meaningless on a portfolio view that has no such field. This means **facets are semantically view-scoped** even though the schema does not enforce field validity.

However, users may want to reuse a carefully configured facet (label wording, config, type) across multiple views that share the same source collection.

### Options for enabling reuse

**Option 1 — Facet Templates (cleanest, most explicit)**
- New `gateway_raptor_facet_template` table stores reusable configs
- When adding a facet to a view, the user picks a template or creates from scratch
- The view still owns its own `RaptorFacet` rows (copied from the template at creation time)
- No changes to existing tables; fully additive

**Option 2 — Copy-on-reuse (low-friction)**
- Make `RaptorFacetList.view_id` nullable
- A special "library" facet list (no `view_id`) holds reusable templates
- UI adds a "Copy to this view" action per template facet
- Slightly messier semantics but requires fewer new tables

**Option 3 — Keep view-scoped, add "Duplicate View"**
- Accept that facets are view-owned; make the config form fast to fill
- Add a "Duplicate View" action that clones the view and all its facets
- Simplest path: no schema changes, no new concepts

### Recommendation

Option 1 is the cleanest long-term model. Option 3 is the right short-term choice while facet config remains minimal — revisit templates once the `config` field is being used meaningfully by more facet types.

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
├── lib/Raptor/Collections/RaptorView.php
├── lib/Raptor/Collections/RaptorFacetList.php
├── lib/Raptor/Collections/RaptorFacet.php
├── lib/Raptor/Controllers/FacetController.php
├── lib/Raptor/Endpoints/FacetRoutes.php
├── lib/Raptor/Endpoints/ViewRoutes.php
├── lib/Raptor/Endpoints/ViewRenderRoutes.php
└── lib/Raptor/store/view-store.js      WP Interactivity store (no facet support)
```
