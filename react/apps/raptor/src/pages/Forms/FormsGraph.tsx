import { useEffect } from 'react'
import {
  useNodesState,
  useEdgesState,
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
} from '@xyflow/react'
import { SharedMiniMap } from '../../components/graph/SharedMiniMap'
import '@xyflow/react/dist/style.css'

const initialNodes: Node[] = [
  {
    id: 'forms-root',
    type: 'default',
    position: { x: 250, y: 150 },
    data: { label: 'Forms' },
    style: {
      background: '#1f2937',
      color: '#f3f4f6',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '500',
    },
  },
]

export function Graph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    setNodes(initialNodes)
    setEdges([])
  }, [setNodes, setEdges])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="rgba(255,255,255,0.2)" />
        <Controls position="top-right" style={{ marginTop: 80, marginRight: 16 }} />
        <SharedMiniMap />
      </ReactFlow>
    </div>
  )
}
