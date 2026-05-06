import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders, generateId } from '../lib/api'
import { COLLECTIONS_NESTED_KEY } from '../lib/queries'
import { useApp } from '../context/app'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RelType = 'belongsTo' | 'hasMany' | 'hasOne' | 'belongsToMany'

export type Relationship = {
  id: string | number
  source: string
  target: string
  source_key?: string
  target_key?: string
  type: RelType
  methodName: string
  foreignKey: string
  ownerKey: string
  pivotTable?: string
  method_name?: string
  foreign_key?: string
  owner_key?: string
}

type CollectionStub = { collection_key: string; title: string }

// ─── Relationship type options ─────────────────────────────────────────────────

export const REL_TYPES: { value: RelType; label: string; hint: string }[] = [
  { value: 'belongsTo',     label: 'Belongs To',      hint: 'Source has the FK → points to target (e.g. post belongsTo user)' },
  { value: 'hasMany',       label: 'Has Many',         hint: 'Target has the FK → source owns many (e.g. user hasMany posts)' },
  { value: 'hasOne',        label: 'Has One',          hint: 'Target has the FK → source owns one (e.g. user hasOne profile)' },
  { value: 'belongsToMany', label: 'Belongs To Many',  hint: 'Many-to-many via a pivot table (e.g. post belongsToMany tags)' },
]

// ─── Naming inference ─────────────────────────────────────────────────────────

function toCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toPlural(word: string): string {
  return word.endsWith('s') ? word : word + 's'
}

export function inferDefaults(
  type: RelType,
  sourceKey: string,
  targetKey: string,
): { methodName: string; foreignKey: string; ownerKey: string; pivotTable: string } {
  const tgt = toCamel(targetKey)
  switch (type) {
    case 'belongsTo':
      return { methodName: tgt,          foreignKey: `${targetKey}_id`, ownerKey: 'id', pivotTable: '' }
    case 'hasMany':
      return { methodName: toPlural(tgt), foreignKey: `${sourceKey}_id`, ownerKey: 'id', pivotTable: '' }
    case 'hasOne':
      return { methodName: tgt,          foreignKey: `${sourceKey}_id`, ownerKey: 'id', pivotTable: '' }
    case 'belongsToMany': {
      const [a, b] = [sourceKey, targetKey].sort()
      return { methodName: toPlural(tgt), foreignKey: `${sourceKey}_id`, ownerKey: 'id', pivotTable: `${a.replace(/s$/, '')}_${b.replace(/s$/, '')}` }
    }
    default:
      return { methodName: '', foreignKey: '', ownerKey: 'id', pivotTable: '' }
  }
}

// ─── Panel shell ──────────────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return { top: shellTopOffset, height: shellHeightCss }
}

export function RelPanelShell({
  title,
  sub,
  onClose,
  children,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  const { top, height } = usePanelGeometry()

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top,
        height,
        width: 340,
        background: '#000',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f4f4f5' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace', marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '2px 4px',
            marginTop: 2,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Relationship form (shared by Create and Edit) ────────────────────────────

export function RelationshipForm({
  sourceKey,
  targetKey,
  collections,
  initial,
  onSave,
  onCancel,
  onDelete,
  isPending,
  isError,
  errorMessage,
}: {
  sourceKey: string
  targetKey: string
  collections: CollectionStub[]
  initial?: Relationship
  onSave: (rel: Omit<Relationship, 'id' | 'source' | 'target'>) => void
  onCancel: () => void
  onDelete?: () => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
}) {
  const [type, setType] = useState<RelType>(initial?.type ?? 'belongsTo')
  const inferredRef = useRef(false)
  const defaults = inferDefaults(type, sourceKey, targetKey)

  const [methodName, setMethodName] = useState(initial?.methodName ?? defaults.methodName)
  const [foreignKey, setForeignKey] = useState(initial?.foreignKey ?? defaults.foreignKey)
  const [ownerKey,   setOwnerKey]   = useState(initial?.ownerKey   ?? defaults.ownerKey)
  const [pivotTable, setPivotTable] = useState(initial?.pivotTable ?? defaults.pivotTable)

  useEffect(() => {
    if (initial && !inferredRef.current) { inferredRef.current = true; return }
    const d = inferDefaults(type, sourceKey, targetKey)
    setMethodName(d.methodName)
    setForeignKey(d.foreignKey)
    setOwnerKey(d.ownerKey)
    setPivotTable(d.pivotTable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const sourceTitle = collections.find((c) => c.collection_key === sourceKey)?.title ?? sourceKey
  const targetTitle = collections.find((c) => c.collection_key === targetKey)?.title ?? targetKey

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!methodName.trim()) return
        onSave({ type, methodName: methodName.trim(), foreignKey: foreignKey.trim(), ownerKey: ownerKey.trim() || 'id', pivotTable: pivotTable.trim() || undefined })
      }}
      className="space-y-5"
    >
      {/* Source → Target */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: '#18181b',
          borderRadius: 6,
          border: '1px solid #1e293b',
        }}
      >
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{sourceTitle}</span>
        <span style={{ fontSize: 12, color: '#52525b' }}>→</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>{targetTitle}</span>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">
          Type <span className="text-red-800">*</span>
        </label>
        <div className="space-y-1.5">
          {REL_TYPES.map((rt) => (
            <label
              key={rt.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 6,
                border: `1px solid ${type === rt.value ? '#52525b' : '#27272a'}`,
                background: type === rt.value ? '#3f3f46' : '#18181b',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="relType"
                value={rt.value}
                checked={type === rt.value}
                onChange={() => setType(rt.value)}
                style={{ marginTop: 2, accentColor: '#52525b' }}
              />
              <div>
                <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{rt.label}</div>
                <div style={{ fontSize: 10, color: '#71717a', marginTop: 1 }}>{rt.hint}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Method name */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">
          Method Name <span className="text-red-800">*</span>
        </label>
        <input
          type="text"
          value={methodName}
          autoFocus
          disabled={isPending}
          placeholder={defaults.methodName}
          onChange={(e) => setMethodName(e.target.value)}
          className={baseInput}
        />
        <p className="mt-1 text-[10px] text-zinc-600">camelCase PHP method on the source model</p>
      </div>

      {/* Foreign key */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Foreign Key</label>
        <input
          type="text"
          value={foreignKey}
          disabled={isPending}
          placeholder={defaults.foreignKey}
          onChange={(e) => setForeignKey(e.target.value)}
          className={baseInput}
        />
      </div>

      {/* Owner key */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Owner Key</label>
        <input
          type="text"
          value={ownerKey}
          disabled={isPending}
          placeholder="id"
          onChange={(e) => setOwnerKey(e.target.value)}
          className={baseInput}
        />
      </div>

      {/* Pivot table (belongsToMany only) */}
      {type === 'belongsToMany' && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Pivot Table</label>
          <input
            type="text"
            value={pivotTable}
            disabled={isPending}
            placeholder={defaults.pivotTable}
            onChange={(e) => setPivotTable(e.target.value)}
            className={baseInput}
          />
        </div>
      )}

      {isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {errorMessage ?? 'Something went wrong'}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending || !methodName.trim()}
          className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Add Relationship'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 text-xs font-medium transition-colors"
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="px-4 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-700 disabled:opacity-50 text-red-300 text-xs font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}

// ─── Create panel ─────────────────────────────────────────────────────────────

export function CreateRelationshipPanel({
  sourceKey,
  targetKey,
  collections,
  onClose,
}: {
  sourceKey: string
  targetKey: string
  collections: CollectionStub[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (fields: Omit<Relationship, 'id' | 'source' | 'target'>) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { collection?: { relationships?: Relationship[] } }
      const existing: Relationship[] = json.collection?.relationships ?? []

      const newRel: Relationship = { id: generateId(), source: sourceKey, target: targetKey, ...fields }

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${sourceKey}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: [...existing, newRel] }),
      })
      const patchJson = await patchRes.json() as { success: boolean; message?: string }
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to save relationship')
      return patchJson
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      onClose()
    },
  })

  return (
    <RelPanelShell title="New Relationship" sub={`${sourceKey} → ${targetKey}`} onClose={onClose}>
      <RelationshipForm
        sourceKey={sourceKey}
        targetKey={targetKey}
        collections={collections}
        onSave={(fields) => mutation.mutate(fields)}
        onCancel={onClose}
        isPending={mutation.isPending}
        isError={mutation.isError}
        errorMessage={(mutation.error as Error | null)?.message}
      />
    </RelPanelShell>
  )
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

export function EditRelationshipPanel({
  rel,
  collections,
  onClose,
}: {
  rel: Relationship
  collections: CollectionStub[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (fields: Omit<Relationship, 'id' | 'source' | 'target'>) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { collection?: { relationships?: Relationship[] } }
      const existing: Relationship[] = json.collection?.relationships ?? []
      const updated = existing.map((r) => r.id === rel.id ? { ...r, ...fields } : r)

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: updated }),
      })
      const patchJson = await patchRes.json() as { success: boolean; message?: string }
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to update relationship')
      return patchJson
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_NESTED_KEY })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { collection?: { relationships?: Relationship[] } }
      const existing: Relationship[] = json.collection?.relationships ?? []

      const patchRes = await fetch(apiUrl(`gateway/v1/raptor/collection/${rel.source}`), {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ relationships: existing.filter((r) => r.id !== rel.id) }),
      })
      const patchJson = await patchRes.json() as { success: boolean; message?: string }
      if (!patchJson.success) throw new Error(patchJson.message ?? 'Failed to delete relationship')
      return patchJson
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_NESTED_KEY })
      onClose()
    },
  })

  const isPending = saveMutation.isPending || deleteMutation.isPending

  return (
    <RelPanelShell title="Edit Relationship" sub={`${rel.source} → ${rel.target}`} onClose={onClose}>
      <RelationshipForm
        sourceKey={rel.source}
        targetKey={rel.target}
        collections={collections}
        initial={rel}
        onSave={(fields) => saveMutation.mutate(fields)}
        onCancel={onClose}
        onDelete={() => deleteMutation.mutate()}
        isPending={isPending}
        isError={saveMutation.isError || deleteMutation.isError}
        errorMessage={((saveMutation.error ?? deleteMutation.error) as Error | null)?.message}
      />
    </RelPanelShell>
  )
}
