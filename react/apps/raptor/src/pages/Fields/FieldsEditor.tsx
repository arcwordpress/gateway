import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS-only package; declarations in src/types.d.ts
import { ControlledForm, useFieldType } from '@arcwp/gateway-forms'
import '@arcwp/gateway-forms/style.css'
import { Field, FieldTypeDef } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'
import { Trash2 } from 'lucide-react'
import { useApp } from '../../context/app'
import { HandleIcon } from '../../components/HandleIcon'
import { useCollection, useFields, SurfaceState } from './FieldsPageContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFieldTypeLabel(type: string): string {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FieldRenderer = ({ config }: { config: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Input } = (useFieldType as any)(config)
  return <Input config={config} />
}

function TabbedFieldConfig({
  fields,
  values,
  onChange,
}: {
  fields: FieldTypeDef['fields']
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
}) {
  const groups: Record<string, FieldTypeDef['fields']> = {}
  for (const field of fields) {
    const g = field.group ?? 'general'
    ;(groups[g] ??= []).push(field)
  }
  const groupKeys = Object.keys(groups)
  const [activeTab, setActiveTab] = useState(groupKeys[0] ?? 'general')

  const visibleFields = groupKeys.length > 1 ? (groups[activeTab] ?? []) : fields

  return (
    <ControlledForm values={values} onChange={onChange}>
      {groupKeys.length > 1 && (
        <div className="flex gap-1 mb-4 border-b border-zinc-700">
          {groupKeys.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveTab(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                activeTab === g
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {g.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}
      {visibleFields.map(f =>
        !f.name || !f.type ? null : <FieldRenderer key={f.name} config={f} />
      )}
    </ControlledForm>
  )
}

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

// ─── Panel geometry ───────────────────────────────────────────────────────────

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return {
    top: shellTopOffset,
    height: shellHeightCss,
  }
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

function EditPanel({ title, sub, onClose, children }: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  const { top, height } = usePanelGeometry()
  return (
    <div style={{
      position: 'fixed', right: 0, top, height, width: 320,
      background: '#18181b', borderLeft: '1px solid #1e293b',
      zIndex: 100000, display: 'flex', flexDirection: 'column', color: 'white',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f4f4f5' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{sub}</div>}
        </div>
        <button onClick={onClose} aria-label="Close panel" style={{
          color: '#71717a', fontSize: 18, lineHeight: 1,
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>✕</button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

// ─── SortableFieldItem ────────────────────────────────────────────────────────

function SortableFieldItem({ field, setEditSurface }: { field: Field; setEditSurface: (s: SurfaceState) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.name })
  const { moveField } = useFields()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative flex gap-2 items-center border border-zinc-700 px-2 py-1.5 rounded transition-opacity ${
        isDragging ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'
      }`}
    >
      <div {...attributes} {...listeners} className="flex items-center cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 shrink-0">
        <HandleIcon />
      </div>
      <span className="text-xs text-zinc-200 truncate flex-1 min-w-0">{field.label}</span>
      <span className="text-[10px] text-zinc-500 shrink-0">{field.type}</span>
      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
        <button
          onClick={() => moveField(field.name, 'up')}
          className="px-1.5 py-0.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
        >
          ↑
        </button>
        <button
          onClick={() => moveField(field.name, 'down')}
          className="px-1.5 py-0.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
        >
          ↓
        </button>
        <button
          onClick={() => setEditSurface({ mode: 'editField', field })}
          className="px-1.5 py-0.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => setEditSurface({ mode: 'deleteConfirm', field })}
          className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Delete field"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </li>
  )
}

// ─── FieldsList ───────────────────────────────────────────────────────────────

export function FieldsList({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  const { fields, addField, moveField } = useFields()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const collectionKey = collection?.collection_key
  const fieldListId   = collection?.field_list?.id

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; label: string; sort_order: number }) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/field'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ field_list_id: fieldListId, ...data }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create field')
      return json.field as Field
    },
    onSuccess: (field) => {
      addField(field)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeField = fields.find(f => f.name === active.id)
    const overField = fields.find(f => f.name === over.id)

    if (!activeField || !overField) return

    const activeIndex = fields.indexOf(activeField)
    const overIndex = fields.indexOf(overField)

    if (activeIndex < overIndex) {
      for (let i = activeIndex; i < overIndex; i++) {
        moveField(fields[i].name, 'down')
      }
    } else {
      for (let i = activeIndex; i > overIndex; i--) {
        moveField(fields[i].name, 'up')
      }
    }
  }

  return (
    <section>
      <header className="flex justify-between items-center gap-4 mb-6">
        <h2 className="!text-white text-base font-semibold">Field List</h2>
        <button
          className="text-3xl disabled:opacity-50"
          disabled={addMutation.isPending || !fieldListId}
          onClick={() => addMutation.mutate({ name: `field_${fields.length}`, type: 'text', label: 'New Field', sort_order: fields.length })}
        >+</button>
      </header>
      {!fieldListId && (
        <p className="mb-6 text-xs text-zinc-400">
          This is very unusual, this Collection does not have a Field List row associated with it.
        </p>
      )}
      {addMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(addMutation.error as Error).message}
        </div>
      )}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.name)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {fields.map((field) => (
              <SortableFieldItem key={field.name} field={field} setEditSurface={setEditSurface} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  )
}

// ─── FieldEditForm ────────────────────────────────────────────────────────────

export function FieldEditForm({ field, onClose }: { field: Field; onClose: () => void }) {
  const { updateField } = useFields()
  const { collection }  = useCollection()
  const queryClient     = useQueryClient()
  const [name, setName]   = useState(field.name)
  const [type, setType]   = useState(field.type)
  const [label, setLabel] = useState(field.label)
  const [extras, setExtras] = useState<Record<string, unknown>>(field.config ?? {})

  const handleExtrasChange = useCallback(
    (name: string, value: unknown) => setExtras(prev => ({ ...prev, [name]: value })),
    []
  )

  const { data: fieldTypeDefs, isLoading: typesLoading } = useQuery<FieldTypeDef[]>({
    queryKey: ['field-types'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/field-types'), { headers: authHeaders() })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to load field types')
      return json.data as FieldTypeDef[]
    },
    staleTime: Infinity,
  })

  const selectedTypeDef = fieldTypeDefs?.find(ft => ft.type === type)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/field/${field.id}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name, type, label, config: extras }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update field')
      return json.field as Field
    },
    onSuccess: (updated) => {
      updateField(field.name, updated)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
               className={baseInput} required disabled={mutation.isPending} />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className={baseInput}
          disabled={mutation.isPending || typesLoading}
        >
          {typesLoading && <option value={type}>{formatFieldTypeLabel(type)}</option>}
          {fieldTypeDefs?.map(ft => (
            <option key={ft.type} value={ft.type}>{formatFieldTypeLabel(ft.type)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Label</label>
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
               className={baseInput} required disabled={mutation.isPending} />
      </div>

      {selectedTypeDef && selectedTypeDef.fields.length > 0 && (
        <div className="pt-3 border-t border-zinc-800">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Field Configuration
          </div>
          <TabbedFieldConfig
            fields={selectedTypeDef.fields}
            values={extras}
            onChange={handleExtrasChange}
          />
        </div>
      )}

      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button type="submit"
                disabled={mutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onClose}
                disabled={mutation.isPending}
                className="px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors disabled:opacity-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── DeleteConfirmation ───────────────────────────────────────────────────────

export function DeleteConfirmation({ field, onClose }: { field: Field; onClose: () => void }) {
  const { deleteField } = useFields()
  const { collection }  = useCollection()
  const queryClient     = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/field/${field.id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete field')
    },
    onSuccess: () => {
      deleteField(field.name)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-zinc-300 text-sm">Delete <strong className="text-white">{field.label}</strong>?</p>
      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Editor wrapper ──────────────────────────────────────────────────────────

export function Editor({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  return (
    <section className="text-white">
      <FieldsList setEditSurface={setEditSurface} />
    </section>
  )
}

// ─── Exports for panel integration ────────────────────────────────────────────

export { EditPanel }
