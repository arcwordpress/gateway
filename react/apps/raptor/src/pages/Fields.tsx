import { createContext, useContext, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { apiUrl, authHeaders } from '../lib/api'

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
      const res = await fetch(apiUrl(`gateway/v1/raptor/collections/${collectionKey}`), {
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

  return (
    <FieldsContext.Provider value={{ fields, addField, moveField, deleteField }}>
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

  // initialNodes is consumed only on first mount; by the time Graph renders,
  // FieldsContent has already gated on isLoading so collection is defined.
  const initialNodes: Node[] = [
    { id: '1',            type: 'default', data: { label: collection?.title },    position: { x: 0,    y: 0   } },
    { id: 'node-2',       type: 'default', data: { label: 'JSON Schema' },        position: { x: 0,    y: 200 } },
    { id: 'node-db-table',type: 'default', data: { label: 'Database Table' },     position: { x: -100, y: 200 } },
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
  return <div>{collection?.title}</div>
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
              <button onClick={() => setEditSurface({ mode: 'edit', field })}>Edit</button>
              <button onClick={() => setEditSurface({ mode: 'deleteConfirm', field })}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Edit panel / Delete confirmation ────────────────────────────────────────

function EditPanel({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed',
      right: 0, top: 0, bottom: 0,
      width: 320,
      background: '#0f0f0f',
      borderLeft: '1px solid #1e293b',
      zIndex: 100000,
      padding: '20px',
      color: 'white',
    }}>
      <button onClick={onClose}>✕</button>
      {children}
    </div>
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
    <section>
      <a href="https://arcwp.ca/docs">DOCS</a>
      <a href="https://arcwp.ca/support">SUPPORT</a>
    </section>
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
    <section className="text-white">
      <TopBar />
      <div>
        <h5>COLLECTION</h5>
        <CollectionName />
      </div>
      <h3>FIELDS</h3>
      <div>
        <h2>Output Files</h2>
        <article>
          <ul>
            <li><h3 className="!text-white">Event.php</h3></li>
            <li><h3>Migrate.php</h3></li>
          </ul>
        </article>
      </div>
      <div className="flex space-between items-center">
        <Editor setEditSurface={setEditSurface} />
        <Graph />
      </div>

      {editSurface && (
        <EditPanel onClose={() => setEditSurface(null)}>
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation field={editSurface.field} onClose={() => setEditSurface(null)} />
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
  const { key } = useParams({ strict: false }) as { key: string }
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <CollectionProvider collectionKey={key}>
      <FieldsProvider>
        <FieldsContent editSurface={editSurface} setEditSurface={setEditSurface} />
      </FieldsProvider>
    </CollectionProvider>
  )
}
