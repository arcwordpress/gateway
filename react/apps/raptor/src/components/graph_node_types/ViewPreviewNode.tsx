import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type ViewPreviewNodeType } from './types'

function cellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function ViewPreviewNode({ data }: NodeProps<ViewPreviewNodeType>) {
  const cols = data.columns
  const rows = data.rows

  return (
    <div
      style={{
        background: '#18181b',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#e4e4e7',
        minWidth: 420,
        maxWidth: 560,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div
        style={{
          background: '#27272a',
          borderBottom: '1px solid #1f2937',
          padding: '8px 12px',
        }}
      >
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginBottom: 2 }}>
          View Preview
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5' }}>{data.title}</div>
      </div>

      {cols.length === 0 ? (
        <div style={{ padding: '10px 12px', color: '#71717a', fontSize: 12, fontStyle: 'italic' }}>
          No columns selected for this view.
        </div>
      ) : (
        <div style={{ padding: 8 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols.length}, minmax(100px, 1fr))`,
              gap: 0,
              border: '1px solid #1e293b',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {cols.map((col: string) => (
              <div
                key={`head-${col}`}
                style={{
                  padding: '6px 8px',
                  borderBottom: '1px solid #1e293b',
                  background: '#18181b',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#a1a1aa',
                  fontFamily: 'monospace',
                }}
              >
                {col}
              </div>
            ))}

            {(rows.length > 0 ? rows : [Object.fromEntries(cols.map((c: string) => [c, '—']))]).map((row: Record<string, unknown>, rowIndex: number) =>
              cols.map((col: string) => (
                <div
                  key={`cell-${rowIndex}-${col}`}
                  style={{
                    padding: '6px 8px',
                    borderBottom: rowIndex === rows.length - 1 ? 'none' : '1px solid #17202f',
                    background: rowIndex % 2 === 0 ? '#18181b' : '#27272a',
                    fontSize: 11,
                    color: '#d4d4d8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cellValue(row[col])}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
