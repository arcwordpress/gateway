import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type DbNodeData } from './types'

export function DatabaseNode({ data }: NodeProps<DbNodeData>) {
  return (
    <div
      style={{
        background: '#1a2e1a',
        border: '1px solid #22c55e',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#dcfce7',
        fontSize: 12,
        minWidth: 200,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ade80', marginBottom: 6, fontWeight: 600 }}>
        Database Table
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#86efac', wordBreak: 'break-all' }}>
        {data.tableName}
      </div>
      {data.recordCount !== null && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>
          {data.recordCount.toLocaleString()} record{data.recordCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
