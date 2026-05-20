import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const nodeStyle = { background: '#27272a', border: '1px solid #3f3f46', color: '#f4f4f5', borderRadius: '0.5rem' }

const initialNodes = [
  { id: '1', type: 'default', position: { x: 200, y: 150 }, data: { label: 'Start' }, style: nodeStyle },
  { id: '2', type: 'default', position: { x: 500, y: 150 }, data: { label: 'Render' }, style: nodeStyle },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
]

export default function Dashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const nextId = useRef(initialNodes.length + 1)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const addNode = useCallback(() => {
    const id = String(nextId.current++)
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'default',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 50 },
        data: { label: `Node ${id}` },
        style: nodeStyle,
      },
    ])
  }, [setNodes])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 tracking-wide">Render</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Visual flow canvas</p>
        </div>
        <button
          onClick={addNode}
          className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded transition-colors"
        >
          Add node
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
