import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ExtNodeType = Node<{ title: string; extKey: string; isActive: boolean; onManage?: () => void }, 'extensionNode'>

export function ExtensionNode({ data }: NodeProps<ExtNodeType>) {
  return (
    <div
      style={{
        background: data.isActive ? '#1e3a8a' : '#1f2937',
        border: `1px solid ${data.isActive ? '#3b82f6' : '#374151'}`,
        borderRadius: 10,
        padding: '10px 16px',
        color: data.isActive ? '#bfdbfe' : '#d1d5db',
        fontSize: 13,
        fontWeight: data.isActive ? 600 : 500,
        minWidth: 160,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <Handle id="action-target" type="target" position={Position.Left} />
      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: data.isActive ? '#60a5fa' : '#9ca3af',
          opacity: 0.7,
        }}
      >
        Extension
      </div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: data.isActive ? '#93c5fd' : '#9ca3af', marginBottom: 4 }}>
        {data.extKey}
      </div>
      <div>{data.title}</div>

      {/* Manage Extension link */}
      {data.onManage && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onManage?.()
          }}
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${data.isActive ? '#1e3a8a' : '#374151'}`,
            width: '100%',
            padding: '6px 0',
            fontSize: 10,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            color: data.isActive ? '#60a5fa' : '#9ca3af',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = data.isActive ? '#93c5fd' : '#cbd5e1'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = data.isActive ? '#60a5fa' : '#9ca3af'
          }}
        >
          Manage Extension
        </button>
      )}
    </div>
  )
}
