import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type SchemaNodeData } from './types'
import { NodeTypeHeader } from './NodeTypeHeader'

const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  string:  { bg: '#27272a', text: '#a1a1aa' },
  number:  { bg: '#27272a', text: '#a1a1aa' },
  integer: { bg: '#27272a', text: '#a1a1aa' },
  boolean: { bg: '#27272a', text: '#a1a1aa' },
  array:   { bg: '#27272a', text: '#a1a1aa' },
  object:  { bg: '#27272a', text: '#a1a1aa' },
}

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_BADGE_COLORS[type] ?? { bg: '#27272a', text: '#71717a' }
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
      padding: '1px 5px', borderRadius: 4, letterSpacing: '0.03em',
    }}>
      {type}
    </span>
  )
}

export function JsonSchemaNode({ data }: NodeProps<SchemaNodeData>) {
  return (
    <div style={{
      background: 'var(--node-bg)',
      border: '1px solid #4b5563',
      borderRadius: 10,
      minWidth: 220,
      maxWidth: 280,
      fontSize: 11,
      color: '#d4d4d8',
      overflow: 'hidden',
      padding: '8px 10px',
    }}>
      <Handle type="target" position={Position.Top} />

      <NodeTypeHeader label="JSON Schema" />

      <div style={{ fontWeight: 600, color: '#f4f4f5', fontSize: 12, marginBottom: 2 }}>{data.title}</div>
      <div style={{ fontSize: 10, color: '#71717a', marginBottom: 6, fontFamily: 'monospace' }}>
        type: <span style={{ color: '#a1a1aa' }}>object</span>
      </div>

      {/* Properties */}
      <div style={{ padding: '6px 0' }}>
        {data.properties.length === 0 ? (
          <div style={{ color: '#3f3f46', fontStyle: 'italic' }}>no fields defined</div>
        ) : (
          data.properties.map(prop => (
            <div key={prop.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '3px 0', gap: 8,
            }}>
              <span style={{ fontFamily: 'monospace', color: prop.required ? '#e4e4e7' : '#a1a1aa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {prop.required && <span style={{ color: '#ef4444', marginRight: 3 }}>*</span>}
                {prop.name}
              </span>
              <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                <TypeBadge type={prop.type} />
                {prop.format && <TypeBadge type={prop.format} />}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer: built-in id field */}
      <div style={{ borderTop: '1px solid #1f2937', padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', color: '#3f3f46' }}>id</span>
        <TypeBadge type="integer" />
      </div>
    </div>
  )
}
