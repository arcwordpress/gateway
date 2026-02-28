import { useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'

// ─── Dagre layout ──────────────────────────────────────────────────────────

function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 })

  nodes.forEach((n) => g.setNode(n.id, { width: 160, height: 50 }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  Dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    return { ...n, position: { x: pos.x - 80, y: pos.y - 25 } }
  })
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const NODE_STYLE: React.CSSProperties = {
  background: '#1e293b',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: 13,
  padding: '8px 14px',
  width: 160,
}

const rawNodes: Node[] = [
  { id: '1', data: { label: '🗄  Data Source' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '2', data: { label: '⚙  Transform' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '3', data: { label: '🔍  Filter' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '4', data: { label: '∑  Aggregate' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '5', data: { label: '📤  Output' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '6', data: { label: '📝  Logger' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
  { id: '7', data: { label: '🔔  Notifier' }, position: { x: 0, y: 0 }, style: NODE_STYLE },
]

const rawEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', style: { stroke: '#475569' } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#475569' } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#475569' } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#475569' } },
  { id: 'e5-6', source: '5', target: '6', style: { stroke: '#10b981' } },
  { id: 'e5-7', source: '5', target: '7', style: { stroke: '#10b981' } },
]

const layoutedNodes = layoutWithDagre(rawNodes, rawEdges)

// ─── Component ─────────────────────────────────────────────────────────────

export default function Graph() {
  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Graph Editor</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            React Flow · Dagre auto-layout · {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
        <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
          + Add Node
        </button>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-800" style={{ minHeight: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Lines} gap={24} color="#1f2937" />
          <Controls />
          <MiniMap
            nodeColor="#1e293b"
            nodeStrokeColor="#334155"
            maskColor="rgba(3,7,18,0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
