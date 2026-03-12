import { Handle, Position, type NodeProps } from '@xyflow/react'
import { type Node } from '@xyflow/react'
import { type ViewRender } from '../../lib/object_types'

export type RenderStrategyNodeType = Node<
  {
    strategies: { type: string }[]
    viewRenders: ViewRender[]
    activeEngine: string | null
    activeJsType: string
    onSelectEngine: (type: string) => void
    onSelectJsType: (type: string) => void
    onSaveRender: () => void
    onDeleteRender: (id: number) => void
    isSaving: boolean
  },
  'renderStrategyNode'
>

const ENGINE_META: Record<string, { label: string; activeBg: string }> = {
  shortcode: { label: 'Shortcode', activeBg: '#7c3aed' },
  block:     { label: 'Block',     activeBg: '#0369a1' },
  template:  { label: 'Template',  activeBg: '#065f46' },
}

const JS_TYPE_META: Record<string, { label: string; activeBg: string }> = {
  react:  { label: 'React',            activeBg: '#0e7490' },
  preact: { label: 'Preact',           activeBg: '#6d28d9' },
  wpia:   { label: 'WP Interactivity', activeBg: '#b45309' },
}

function engineLabel(engine: string): string {
  return ENGINE_META[engine]?.label ?? engine
}

function jsTypeLabel(jsType: string): string {
  return JS_TYPE_META[jsType]?.label ?? jsType
}

function StrategyButton({
  type, label, activeBg, isActive, onClick,
}: {
  type: string; label: string; activeBg: string; isActive: boolean; onClick: () => void
}) {
  return (
    <button
      key={type}
      onClick={onClick}
      style={{
        padding: '5px 14px',
        fontSize: 11,
        fontWeight: 600,
        background: isActive ? activeBg : '#1e293b',
        border: `1px solid ${isActive ? activeBg : '#334155'}`,
        borderRadius: 5,
        color: isActive ? '#fff' : '#94a3b8',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </button>
  )
}

export function RenderStrategyNode({ data }: NodeProps<RenderStrategyNodeType>) {
  const hasSaves = data.viewRenders.length > 0

  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#e2e8f0',
        minWidth: 320,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '8px 12px' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 2 }}>
          Render Options
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Choose how to embed this view</div>
      </div>

      {/* Saved Renders */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
          Saved Renders
        </div>

        {!hasSaves && (
          <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>No renders saved yet</div>
        )}

        {hasSaves && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.viewRenders.map((r) => {
              const isActive = r.engine === data.activeEngine
              return (
                <div
                  key={r.id}
                  onClick={() => data.onSelectEngine(r.engine)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: isActive ? '#1e293b' : '#0f172a',
                    border: `1px solid ${isActive ? '#334155' : '#1e293b'}`,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                    <span style={{ color: '#a5b4fc' }}>{engineLabel(r.engine)}</span>
                    <span style={{ color: '#475569', margin: '0 5px' }}>·</span>
                    <span style={{ color: '#94a3b8' }}>{jsTypeLabel(r.js_type)}</span>
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); data.onDeleteRender(r.id) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '0 2px',
                      lineHeight: 1,
                      transition: 'color 0.1s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Render form */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
          + New Render
        </div>

        {/* Engine */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Engine</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.strategies.length === 0 && (
              <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>Loading…</span>
            )}
            {data.strategies.map((s) => {
              const meta = ENGINE_META[s.type] ?? { label: s.type, activeBg: '#334155' }
              return (
                <StrategyButton
                  key={s.type}
                  type={s.type}
                  label={meta.label}
                  activeBg={meta.activeBg}
                  isActive={s.type === data.activeEngine}
                  onClick={() => data.onSelectEngine(s.type)}
                />
              )
            })}
          </div>
        </div>

        {/* JS Type */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>JS Type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(JS_TYPE_META).map(([type, meta]) => (
              <StrategyButton
                key={type}
                type={type}
                label={meta.label}
                activeBg={meta.activeBg}
                isActive={type === data.activeJsType}
                onClick={() => data.onSelectJsType(type)}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={data.onSaveRender}
          disabled={!data.activeEngine || data.isSaving}
          style={{
            width: '100%',
            padding: '6px 0',
            fontSize: 11,
            fontWeight: 600,
            background: data.activeEngine && !data.isSaving ? '#1d4ed8' : '#1e293b',
            border: '1px solid transparent',
            borderRadius: 5,
            color: data.activeEngine && !data.isSaving ? '#fff' : '#475569',
            cursor: data.activeEngine && !data.isSaving ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {data.isSaving ? 'Saving…' : 'Save Render'}
        </button>
      </div>
    </div>
  )
}
