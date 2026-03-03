import { createContext, useContext, useState } from 'react'
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type Field = { name: string; type: string; label: string }

const FieldsContext = createContext<{
  fields: Field[]
  addField: (field: Field) => void
  moveField: (name: string, dir: 'up' | 'down') => void
  deleteField: (name: string) => void
} | null>(null)

const COLLECTION = {
    key: 'event',
    title: "Event"
}

const FIELDS = [
  { name: 'title',      type: 'text', label: 'Title'      },
  { name: 'slug',       type: 'slug', label: 'Slug'       },
  { name: 'created_at', type: 'date', label: 'Created At' },
  { name: 'updated_at', type: 'date', label: 'Updated At' },
]

const initialNodes: Node[] = [
  { id: '1', type: 'default', data: { label: COLLECTION.title }, position: { x: 0, y: 0 } },
]
const initialEdges: Edge[] = []

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
    return(
        <div>
            {COLLECTION.title}
        </div>
    )
}

function Editor() {
    return(
        <section className="text-white">
            <FieldsList/>
        </section>
    )
}

function FieldsList() {
  const { fields, addField, moveField, deleteField } = useFields()

  return (
    <section>
      <header>
        <h2>Field List</h2>
        <button onClick={() => addField({ name: `field_${fields.length}`, type: 'text', label: 'New Field' })}>+</button>
      </header>
      <ul>
        {fields.map((field) => (
            <li className="flex gap-4" key={field.name}>
                <button onClick={() => moveField(field.name, 'up')}>Up</button>
                <button onClick={() => moveField(field.name, 'down')}>Down</button>
                <h3 className="!text-white">{field.label}</h3>
                <button onClick={() => addField({ ...field, name: `${field.name}_copy` })}>Copy</button>
                <button onClick={() => deleteField(field.name)}>Delete</button>
            </li>
        ))}
      </ul>
    </section>
  )
}

function FieldsProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = useState(FIELDS)

  const addField = (field: typeof FIELDS[number]) =>
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

function EditPanel({ onClose }: { onClose: () => void }) {
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
      <p>Edit panel content here</p>
    </div>
  )
}

/*************************/
/* FIELDS DEFAULT RENDER */
/*************************/

export default function Fields() {

    const [editSurface, setEditSurface] = useState<'edit' | null>(null)

    return(
        <FieldsProvider>
            <section className="text-white">
                <div>
                    <h5>COLLECTION</h5>
                    <CollectionName/>
                    <button onClick={() => setEditSurface('edit')}>Open Panel</button>   
                </div>
                <h3>FIELDS</h3>
                <div>
                    <h2>Output Files</h2>
                    <article>
                        <ul>
                            <li>
                                <h3 className="!text-white">Event.php</h3>
                            </li>
                            <li>
                                <h3>Migrate.php</h3>
                            </li>
                        </ul>
                    </article>
                </div>
                <div className="flex space-between items-center">
                    <Editor/>
                    <Graph/>
                </div>
            </section>
            
            {editSurface && <EditPanel onClose={() => setEditSurface(null)} />}
        </FieldsProvider>
    )

}