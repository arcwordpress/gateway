import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type PackageNodeData = {
  label: string
  packageKey: string
  icon: string
  onSelect?: (key: string) => void
}

export type PackageNodeType = Node<PackageNodeData, 'packageNode'>

export function PackageNode({ data }: NodeProps<PackageNodeType>) {
  return (
    <div
      onClick={() => data.onSelect?.(data.packageKey)}
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#e4e4e7',
        fontSize: 13,
        fontWeight: 600,
        minWidth: 160,
        cursor: data.onSelect ? 'pointer' : 'default',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <NodeTypeHeader label="Package" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          className={`dashicons ${data.icon ?? 'dashicons-admin-generic'}`}
          style={{ fontSize: 16, color: '#a1a1aa' }}
        />
        <span>{data.label}</span>
      </div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#71717a', marginTop: 3, fontWeight: 400 }}>
        {data.packageKey}
      </div>
    </div>
  )
}
