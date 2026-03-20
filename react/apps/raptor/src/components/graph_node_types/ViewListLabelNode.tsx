import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type ViewListLabelNodeType = Node<{}, 'viewListLabel'>

export function ViewListLabelNode(_: NodeProps<ViewListLabelNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 6,
        padding: '8px 10px',
        minWidth: 100,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <NodeTypeHeader label="View List" />
    </div>
  )
}
