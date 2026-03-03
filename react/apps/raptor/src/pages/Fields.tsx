import { createContext, useContext, useState } from 'react'
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { fieldsRoute } from '../router.ts'

type Field = { name: string; type: string; label: string }

type SurfaceState =
  | { mode: 'deleteConfirm'; field: Field }
  | null

const FieldsContext = createContext<{
  fields: Field[]
  addField: (field: Field) => void
  moveField: (name: string, dir: 'up' | 'down') => void
  deleteField: (name: string) => void
} | null>(null)

const COLLECTION = {
  key: 'event',
  title: 'Event',
  table: 'wp_event'
}

const FIELDS = [
  { name: 'title',      type: 'text', label: 'Title'      },
  { name: 'slug',       type: 'slug', label: 'Slug'       },
  { name: 'created_at', type: 'date', label: 'Created At' },
  { name: 'updated_at', type: 'date', label: 'Updated At' },
]

const initialNodes: Node[] = [
  { id: '1', type: 'default', data: { label: COLLECTION.title }, position: { x: 0, y: 0 } },
  { id: 'node-2', type: 'default', data: { label: "JSON Schema" }, position: { x: 0, y: 200 } },
  { id: 'node-db-table', type: 'default', data: { label: "Database Table" }, position: { x: -100, y: 200 } },
]
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: 'node-2' }
]

function Graph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

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

function CollectionName() {
  return <h1 className="!text-neutral-300 text-2xl font-bold">{COLLECTION.title} ({COLLECTION.key})</h1>
}

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

function FieldsProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = useState(FIELDS)

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

const useFields = () => {
  const ctx = useContext(FieldsContext)
  if (!ctx) throw new Error('useFields must be used within FieldsProvider')
  return ctx
}

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

function TopBar() {
    return(
        <section className="flex gap-6 border border-neutral-600 px-6 py-3 rounded mb-12">
            <a href="https://arcwp.ca/docs">DOCS</a>
            <a href="https://arcwp.ca/support">SUPPORT</a>
        </section>
    )
}

function Files() {
    return(
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

/*************************/
/* FIELDS DEFAULT RENDER */
/*************************/

export default function Fields() {

  const { key } = fieldsRoute.useParams()
  const [editSurface, setEditSurface] = useState<SurfaceState>(null)

  return (
    <FieldsProvider>
      <section className="text-white px-12">
        <TopBar/>
        <div>
          <h4 className="font-medium mb-2">COLLECTION</h4>
          <CollectionName />
        </div>
        <h3>FIELDS</h3>
        <div className="flex space-between">
            <div className="flex flex-col gap-8">
                <Editor setEditSurface={setEditSurface} />
                <Files/>
            </div>
            <Graph />
        </div>
      </section>

      {editSurface && (
        <EditPanel onClose={() => setEditSurface(null)}>
          {editSurface.mode === 'deleteConfirm' && (
            <DeleteConfirmation field={editSurface.field} onClose={() => setEditSurface(null)} />
          )}
        </EditPanel>
      )}
    </FieldsProvider>
  )
}