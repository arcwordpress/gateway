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

const nodeStyle = {
  background: '#27272a',
  border: '1px solid #3f3f46',
  color: '#f4f4f5',
  borderRadius: '0.5rem',
}

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
    <div className="render-dashboard">
      <div className="render-dashboard__header">
        <div>
          <p className="render-dashboard__title">Render</p>
          <p className="render-dashboard__subtitle">Visual flow canvas</p>
        </div>
        <button className="render-btn" onClick={addNode}>
          Add node
        </button>
      </div>

      <div className="render-dashboard__canvas">
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
