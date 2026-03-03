import { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'
import { fieldsRoute } from '../router'
import { useApp } from '../context/app'
import { appConfig } from '../config'

// ─── Types ────────────────────────────────────────────────────────────────────

type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
}

type Field = { name: string; type: string; label: string }

type SurfaceState =
  | { mode: 'deleteConfirm'; field: Field }
  | { mode: 'editField'; field: Field }
  | null

// ─── Collection context ───────────────────────────────────────────────────────

type CollectionContextValue = {
  collection: Collection | undefined
  isLoading: boolean
  isError: boolean
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

export const useCollection = () => {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used inside CollectionProvider')
  return ctx
}

function CollectionProvider({ collectionKey, children }: { collectionKey: string; children: React.ReactNode }) {
  const { data: collection, isLoading, isError } = useQuery<Collection>({
    queryKey: ['raptor-collections', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    enabled: !!collectionKey,
  })

  return (
    <CollectionContext.Provider value={{ collection, isLoading, isError }}>
      {children}
    </CollectionContext.Provider>
  )
}

// ─── Fields context ───────────────────────────────────────────────────────────

const FieldsContext = createContext<{
  fields: Field[]
  addField: (field: Field) => void
  moveField: (name: string, dir: 'up' | 'down') => void
  deleteField: (name: string) => void
  updateField: (oldName: string, updates: Partial<Field>) => void
} | null>(null)

const useFields = () => {
  const ctx = useContext(FieldsContext)
  if (!ctx) throw new Error('useFields must be used within FieldsProvider')
  return ctx
}

function FieldsProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = useState<Field[]>([])

  const addField = (field: Field) =>
    setFields((prev) => [...prev, field])

  const moveField = (name: string, dir: 'up' | 'down') =>
    setFields((prev) => {
      const i = prev.findIndex((f) => f.name === name)
      if (dir === 'up' && i === 0) return prev
      if (dir === 'down' && i === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next
    })

  const deleteField = (name: string) =>
    setFields((prev) => prev.filter((f) => f.name !== name))

  const updateField = (oldName: string, updates: Partial<Field>) =>
    setFields((prev) => prev.map((f) => f.name === oldName ? { ...f, ...updates } : f))

  return (
    <FieldsContext.Provider value={{ fields, addField, moveField, deleteField, updateField }}>
      {children}
    </FieldsContext.Provider>
  )
}

// ─── Graph ────────────────────────────────────────────────────────────────────

const STATIC_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: 'node-2' },
]

function Graph() {
  const { collection } = useCollection()

  const initialNodes: Node[] = [
    { id: '1',             type: 'default', data: { label: collection?.title }, position: { x: 0,    y: 0   } },
    { id: 'node-2',        type: 'default', data: { label: 'JSON Schema' },     position: { x: 0,    y: 200 } },
    { id: 'node-db-table', type: 'default', data: { label: 'Database Table' },  position: { x: -100, y: 200 } },
  ]

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(STATIC_EDGES)

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="#2d3139" />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  )
}

// ─── Collection name ──────────────────────────────────────────────────────────

function CollectionName() {
  const { collection, isLoading } = useCollection()
  if (isLoading) return <div className="h-5 w-32 rounded bg-gray-700 animate-pulse" />
  return <h1 className="!text-neutral-300 text-2xl font-bold">{collection?.title}</h1>
}

// ─── Editor / FieldsList ──────────────────────────────────────────────────────

function Editor({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  return (
    <section className="text-white">
      <FieldsList setEditSurface={setEditSurface} />
    </section>
  )
}

function FieldsList({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  const { fields, addField, moveField } = useFields()

  return (
    <section>
      <header className="flex justify-between items-center gap-6 mb-10">
        <h2 className="!text-white text-xl font-medium">Field List</h2>
        <button className="text-3xl" onClick={() => addField({ name: `field_${fields.length}`, type: 'text', label: 'New Field' })}>+</button>
      </header>
      <ul className="min-w-96">
        {fields.map((field) => (
          <li className="group relative flex gap-8 border border-1 border-white px-4 py-2" key={field.name}>
            <div>HANDLE</div>
            <h3 className="basis-1/2 !text-white">{field.label}</h3>
            <div className="basis-1/2 opacity-0 group-hover:opacity-100 flex gap-2">
              <button onClick={() => addField({ name: `field_${fields.length}`, type: 'text', label: 'New Field' })}>+</button>
              <button onClick={() => addField({ ...field, name: `${field.name}_copy` })}>Copy</button>
              <button onClick={() => moveField(field.name, 'up')}>Up</button>
              <button onClick={() => moveField(field.name, 'down')}>Down</button>
              <button onClick={() => setEditSurface({ mode: 'editField', field })}>Edit</button>
              <button onClick={() => setEditSurface({ mode: 'deleteConfirm', field })}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Edit panel / Delete confirmation ────────────────────────────────────────

function usePanelGeometry() {
  const { isExpanded } = useApp()
  const constrained = appConfig.isWordPress && !isExpanded
  return {
    top:    constrained ? 32  : 0,
    height: constrained ? 'calc(100vh - 32px)' : '100vh',
  }
}

function EditPanel({ title, sub, onClose, children }: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  const { top, height } = usePanelGeometry()
  return (
    <div style={{
      position: 'fixed', right: 0, top, height, width: 320,
      background: '#0f0f0f', borderLeft: '1px solid #1e293b',
      zIndex: 100000, display: 'flex', flexDirection: 'column', color: 'white',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sub}</div>}
        </div>
        <button onClick={onClose} aria-label="Close panel" style={{
          color: '#64748b', fontSize: 18, lineHeight: 1,
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>✕</button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

const FIELD_TYPES = ['text', 'select', 'textarea', 'checkbox', 'radio']

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors text-sm'

function FieldEditForm({ field, onClose }: { field: Field; onClose: () => void }) {
  const { updateField } = useFields()
  const [name, setName]   = useState(field.name)
  const [type, setType]   = useState(field.type)
  const [label, setLabel] = useState(field.label)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateField(field.name, { name, type, label })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
               className={baseInput} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className={baseInput}>
          {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Label</label>
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
               className={baseInput} required />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors">
          Save
        </button>
        <button type="button" onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

function DeleteConfirmation({ field, onClose }: { field: Field; onClose: () => void }) {
  const { deleteField } = useFields()
  return (
    <div>
      <p>Delete <strong>{field.label}</strong>?</p>
      <button onClick={() => { deleteField(field.name); onClose() }}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <section className="flex gap-6 border border-neutral-600 px-6 py-3 rounded mb-12">
      <a href="https://arcwp.ca/docs">DOCS</a>
      <a href="https://arcwp.ca/support">SUPPORT</a>
    </section>
  )
}

// ─── Files ────────────────────────────────────────────────────────────────────

function Files() {
  return (
    <div>
      <h2 className="!text-white text-xl font-medium mb-6">Output Files</h2>
      <article>
        <ul>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Event.php</h3>
          </li>
          <li className="flex gap-6 items-center cursor-pointer">
            <h3 className="!text-white text-lg">Migrate.php</h3>
          </li>
        </ul>
      </article>
    </div>
  )
}

// ─── Inner page (renders after collection resolves) ───────────────────────────

function FieldsContent({ editSurface, setEditSurface }: {
  editSurface: SurfaceState
  setEditSurface: (s: SurfaceState) => void
}) {
  const { isLoading, isError } = useCollection()

  if (isLoading) return <div className="p-8 text-gray-400">Loading collection…</div>
  if (isError)   return <div className="p-8 text-red-400">Failed to load collection.</div>

  return (
    <section className="text-white px-12">
      <TopBar />
      <div>
        <h4 className="font-medium mb-2">COLLECTION</h4>
        <CollectionName />
      </div>
      <div className="flex space-between items-start mt-12">
        <div className="flex flex-col gap-8">
          <Editor setEditSurface={setEditSurface} />
          <Files />
        </div>
        <Graph />
      </div>

      {editSurface && (
        <EditPanel
          title={editSurface.mode === 'editField' ? 'Edit Field' : 'Delete Field'}
          sub={editSurface.field.name}
          onClose={() => setEditSurface(null)}
        >
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
          {editSurface.mode === 'editField' && (
            <FieldEditForm field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </section>
  )
}

/*************************/
/* FIELDS DEFAULT RENDER */
/*************************/

export default function Fields() {
  const { key } = fieldsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={key}>
      <FieldsProvider>
        <FieldsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </FieldsProvider>
    </CollectionProvider>
  )
}