import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ViewListLabelNodeType = Node<{}, 'viewListLabel'>

export function ViewListLabelNode(_: NodeProps<ViewListLabelNodeType>) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 6,
        padding: '6px 12px',
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        minWidth: 100,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      View List
    </div>
  )
}
