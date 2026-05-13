import { useState, useMemo } from 'react'
import { ExternalLink, Search, X, BookOpen, ChevronRight } from 'lucide-react'

// ─── Static doc entries ───────────────────────────────────────────────────────
interface DocEntry {
  id: string
  title: string
  category: string
  summary: string
  content: string
}

const DOCS: DocEntry[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Introduction',
    summary: 'Install and configure the Gateway plugin for your WordPress site.',
    content: `## Getting Started with Gateway

Gateway is a headless CMS layer for WordPress that lets you define collections, fields, views, and forms — then expose them via a REST API.

### Installation

1. Upload the \`gateway\` plugin folder to \`/wp-content/plugins/\`
2. Activate it from the **Plugins** screen in WordPress admin
3. Navigate to **Gateway → Raptor** in the admin menu

### Initial Configuration

Open **Settings → Database** and choose your storage driver:

- **SQLite** (default) — zero-config, stores data alongside the plugin
- **MySQL/PostgreSQL** — connect to an external database for production use

Once the driver is selected, Gateway will run any pending migrations automatically.

### Next Steps

- Create your first **Collection** to define a data model
- Add **Fields** to describe the shape of each record
- Use **Records** to create and manage your content`,
  },
  {
    id: 'collections',
    title: 'Collections',
    category: 'Core Concepts',
    summary: 'Define and manage data models using collections.',
    content: `## Collections

A **Collection** is Gateway's equivalent of a database table or a WordPress custom post type. It defines a named set of records that share the same field structure.

### Creating a Collection

1. Go to **Collections** in the sidebar
2. Click **New Collection**
3. Enter a unique **Collection Key** (snake_case recommended, e.g. \`blog_posts\`)
4. Optionally set a human-readable label

### Collection Keys

Collection keys are permanent identifiers used throughout the API and in relationships. Choose them carefully — renaming a key requires updating all references.

### Registered vs. Dynamic Collections

| Type | Description |
|------|-------------|
| **Dynamic** | Created in Raptor UI, stored in the Gateway database |
| **Registered** | Defined in PHP code via \`gateway_register_collection()\` |

Registered collections appear under **Collections → Registered** and are read-only in the UI.

### Relationships

Collections can reference each other through relational fields. View all relationships on the **Collections → Relationships** graph.`,
  },
  {
    id: 'fields',
    title: 'Fields',
    category: 'Core Concepts',
    summary: 'Build the field structure that defines each record in a collection.',
    content: `## Fields

Fields define the **schema** of a collection — what properties each record has and what type of data they hold.

### Field Types

| Type | Description |
|------|-------------|
| \`text\` | Single-line string |
| \`textarea\` | Multi-line string |
| \`number\` | Integer or float |
| \`boolean\` | True / false toggle |
| \`date\` | ISO date string |
| \`datetime\` | ISO datetime string |
| \`select\` | Enum — one value from a predefined list |
| \`multi_select\` | Enum — multiple values |
| \`relationship\` | Reference to a record in another collection |
| \`media\` | Attachment / file reference |
| \`json\` | Arbitrary JSON blob |

### Adding Fields

1. Open a collection, then click **Fields** in the top bar
2. Click **Add Field** and choose a type
3. Set the field key and any type-specific options
4. Save — Gateway applies the schema migration immediately

### Required & Default Values

Mark a field as **required** to enforce a non-null constraint at the API level. Provide a **default value** to pre-populate new records.`,
  },
  {
    id: 'records',
    title: 'Records',
    category: 'Core Concepts',
    summary: 'Create, read, update, and delete content entries.',
    content: `## Records

Records are the actual **content entries** stored in a collection — the rows in your table.

### Browsing Records

Navigate to **Records** in the sidebar, then select a collection. The list view shows all records with their primary fields.

### Creating a Record

1. Click **New Record** from the list view
2. Fill in the fields defined by the collection schema
3. Click **Save**

### Editing & Deleting

- Click a row to open the **View** panel
- Use **Edit** to modify fields
- Use **Delete** to permanently remove the record (this cannot be undone)

### Filtering & Sorting

The records list supports column sorting and text search across text fields.

### Via the API

Records are also accessible over REST:

\`\`\`
GET  /wp-json/gateway/v1/records/{collection_key}
POST /wp-json/gateway/v1/records/{collection_key}
PUT  /wp-json/gateway/v1/records/{collection_key}/{id}
DELETE /wp-json/gateway/v1/records/{collection_key}/{id}
\`\`\``,
  },
  {
    id: 'views',
    title: 'Views',
    category: 'Builders',
    summary: 'Design custom read layouts for your collection data.',
    content: `## Views

A **View** defines how data from a collection is shaped and filtered when read through the API. Think of it as a named query + projection.

### Creating a View

1. Open a collection, then navigate to **Views**
2. Click **New View**
3. Name the view and configure:
   - **Fields to include** — pick which fields are returned
   - **Filters** — restrict records by field values
   - **Sort order** — default ordering for results

### Accessing a View via API

\`\`\`
GET /wp-json/gateway/v1/views/{collection_key}/{view_key}
\`\`\`

This returns only the records and fields specified in the view definition.

### Design Mode

Switch to **Design** mode from the view builder to arrange fields visually and preview the rendered output.`,
  },
  {
    id: 'forms',
    title: 'Forms',
    category: 'Builders',
    summary: 'Build input forms backed by a collection for front-end submissions.',
    content: `## Forms

A **Form** is a write-side counterpart to a View. It defines a set of input fields that map to a collection and are exposed as a public submission endpoint.

### Creating a Form

1. Open a collection, then navigate to **Forms**
2. Click **New Form**
3. Select which fields to expose
4. Configure per-field validation rules

### Submission Endpoint

\`\`\`
POST /wp-json/gateway/v1/forms/{collection_key}/{form_key}/submit
\`\`\`

Submissions are validated against the form's rules and, on success, create a new record in the associated collection.

### Authentication

Forms can be set to:
- **Public** — no authentication required (useful for contact forms)
- **Authenticated** — requires a valid WordPress nonce or application password`,
  },
  {
    id: 'extensions',
    title: 'Extensions',
    category: 'Advanced',
    summary: 'Extend Gateway with custom field types, hooks, and integrations.',
    content: `## Extensions

Extensions let you augment Gateway with custom logic — new field types, lifecycle hooks, external integrations, and more.

### Registering an Extension

In your theme or a custom plugin:

\`\`\`php
add_action('gateway_register_extensions', function($registry) {
  $registry->register('my_extension', [
    'label'   => 'My Extension',
    'version' => '1.0.0',
    'hooks'   => MyExtension::class,
  ]);
});
\`\`\`

### Extension Hooks

| Hook | Description |
|------|-------------|
| \`before_record_create\` | Runs before a record is inserted |
| \`after_record_create\` | Runs after a successful insert |
| \`before_record_update\` | Runs before an update |
| \`after_record_update\` | Runs after a successful update |
| \`before_record_delete\` | Runs before deletion |

### Viewing Extensions

The **Extensions** graph in Raptor shows all registered extensions and how they relate to your collections.`,
  },
  {
    id: 'settings',
    title: 'Settings',
    category: 'Configuration',
    summary: 'Configure database drivers, AI features, and collection defaults.',
    content: `## Settings

Open **Settings** from the sidebar to configure global Gateway options.

### Database

| Setting | Description |
|---------|-------------|
| **Driver** | \`sqlite\`, \`mysql\`, or \`pgsql\` |
| **Connection Port** | Port for MySQL/PostgreSQL connections |
| **SQLite Path** | Absolute path to the \`.sqlite\` file |

### AI

Gateway integrates with the Anthropic API to power AI-assisted field suggestions and record enrichment.

Enter your **Anthropic API Key** here. The key is stored encrypted in the database and never exposed via the REST API.

### Collections

Set global defaults that apply to newly created collections:

- **Default sort field**
- **Records per page** (pagination default)
- **Soft deletes** — keep deleted records with a \`deleted_at\` timestamp instead of hard-deleting them`,
  },
  {
    id: 'rest-api',
    title: 'REST API Reference',
    category: 'API',
    summary: 'Full reference for all Gateway REST endpoints.',
    content: `## REST API Reference

All Gateway endpoints are mounted under \`/wp-json/gateway/v1/\`.

### Authentication

Use a WordPress **Application Password** or a valid **nonce** in the \`X-WP-Nonce\` header.

### Collections

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/collection\` | List all collections |
| POST | \`/collection\` | Create a collection |
| GET | \`/collection/{key}\` | Get a single collection |
| PUT | \`/collection/{key}\` | Update a collection |
| DELETE | \`/collection/{key}\` | Delete a collection |

### Records

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/records/{key}\` | List records |
| POST | \`/records/{key}\` | Create a record |
| GET | \`/records/{key}/{id}\` | Get one record |
| PUT | \`/records/{key}/{id}\` | Update a record |
| DELETE | \`/records/{key}/{id}\` | Delete a record |

### Views & Forms

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/views/{key}/{view}\` | Query a view |
| POST | \`/forms/{key}/{form}/submit\` | Submit a form |

### Response Format

All responses follow the format:

\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

Errors return HTTP 4xx/5xx with:

\`\`\`json
{
  "success": false,
  "message": "Human-readable error"
}
\`\`\``,
  },
]

const CATEGORIES = [...new Set(DOCS.map((d) => d.category))]

// ─── Modal ─────────────────────────────────────────────────────────────────
function DocModal({ doc, onClose }: { doc: DocEntry; onClose: () => void }) {
  // Very simple markdown-to-JSX renderer (headings, code, tables, paragraphs)
  const lines = doc.content.split('\n')

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[75vh] flex flex-col rounded-lg border border-zinc-700 overflow-hidden"
        style={{ backgroundColor: 'var(--gty-admin-dark)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{doc.category}</p>
            <h2 className="text-lg font-semibold text-zinc-100 mt-0.5">{doc.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-zinc-300 leading-relaxed space-y-3">
          {lines.map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-base font-semibold text-zinc-100 mt-4 first:mt-0">{line.slice(3)}</h2>
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-sm font-semibold text-zinc-200 mt-3">{line.slice(4)}</h3>
            }
            if (line.startsWith('```')) {
              return null // handled below
            }
            if (line.startsWith('| ')) {
              return (
                <div key={i} className="font-mono text-xs text-zinc-400 bg-zinc-900 rounded px-3 py-1 border border-zinc-800">
                  {line}
                </div>
              )
            }
            if (line.startsWith('- ') || line.startsWith('1. ') || /^\d+\. /.test(line)) {
              return <p key={i} className="text-zinc-300 pl-4">{line}</p>
            }
            if (line.trim() === '') {
              return <div key={i} className="h-1" />
            }
            return <p key={i} className="text-zinc-300">{line}</p>
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Docs page ─────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocEntry | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return DOCS.filter((d) => {
      const matchesSearch =
        !q || d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      const matchesCategory = !activeCategory || d.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-800 shrink-0 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Documentation</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Browse guides and references for Gateway</p>
        </div>

        {/* Live docs CTA */}
        <a
          href="https://arcwp.ca/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-3 px-5 py-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 transition-colors group"
        >
          <BookOpen className="h-5 w-5 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors leading-tight">
              Full Documentation
            </p>
            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors leading-tight mt-0.5">
              arcwp.ca/docs
            </p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-1" />
        </a>
      </div>

      {/* ── Toolbar: search + category filters ───────────────────────── */}
      <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-3 shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              activeCategory === null
                ? 'border-zinc-500 bg-zinc-700 text-zinc-100'
                : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'border-zinc-500 bg-zinc-700 text-zinc-100'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Doc list ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">No results for <span className="text-zinc-300">"{search}"</span></p>
            <button onClick={() => { setSearch(''); setActiveCategory(null) }} className="mt-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="w-full text-left flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{doc.category}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{doc.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{doc.summary}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {selectedDoc && (
        <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  )
}
