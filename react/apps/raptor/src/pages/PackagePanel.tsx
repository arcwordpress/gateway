import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import PanelShell from '../components/ui/PanelShell'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Types ─────────────────────────────────────────────────────────────────

type FormValues = {
  label: string
  description: string
  icon: string
  position: number
  capability: string
  parent: string
}

export type PackagePanelProps =
  | { mode: 'create'; extensionKey: string; onClose: () => void; onCreated: (key: string) => void }
  | { mode: 'edit'; packageKey: string; onClose: () => void; onDeleted: () => void }

// ─── Styles ────────────────────────────────────────────────────────────────

const inp =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-40 text-sm'

const lbl = 'block text-xs font-medium text-zinc-400 mb-1'

// ─── Save status indicator ─────────────────────────────────────────────────

function SaveStatus({ saving, error }: { saving: boolean; error: string | null }) {
  if (error) return <span className="text-red-400 text-[10px]">{error}</span>
  if (saving) return <span className="text-zinc-500 text-[10px]">Saving…</span>
  return <span className="text-zinc-600 text-[10px]">Autosaved</span>
}

// ─── Shared fields ─────────────────────────────────────────────────────────

function PackageFields({ register }: { register: ReturnType<typeof useForm<FormValues>>['register'] }) {
  return (
    <>
      <div>
        <label className={lbl}>Description</label>
        <input {...register('description')} className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Icon</label>
          <input {...register('icon')} className={inp} placeholder="dashicons-admin-generic" />
        </div>
        <div>
          <label className={lbl}>Position</label>
          <input {...register('position', { valueAsNumber: true })} type="number" className={inp} />
        </div>
      </div>
      <div>
        <label className={lbl}>Capability</label>
        <input {...register('capability')} className={inp} placeholder="manage_options" />
      </div>
      <div>
        <label className={lbl}>
          Parent menu slug
          <span className="ml-1 text-zinc-600 font-normal">blank = top-level</span>
        </label>
        <input {...register('parent')} className={inp} placeholder="options-general.php" />
      </div>
    </>
  )
}

// ─── Create panel ──────────────────────────────────────────────────────────

function CreatePanel({ extensionKey, onClose, onCreated }: Extract<PackagePanelProps, { mode: 'create' }>) {
  const queryClient = useQueryClient()
  const { register, watch } = useForm<FormValues>({
    defaultValues: { label: '', description: '', icon: 'dashicons-admin-generic', position: 20, capability: 'manage_options', parent: '' },
  })
  const values = watch()
  const createdRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/package'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          extension_key: extensionKey,
          label:         v.label.trim(),
          description:   v.description.trim(),
          icon:          v.icon || 'dashicons-admin-generic',
          position:      v.position || 20,
          capability:    v.capability || 'manage_options',
          parent:        v.parent.trim() || null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create package')
      return json.package as { package_key: string }
    },
    onSuccess: (pkg) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      onCreated(pkg.package_key)
    },
  })

  // Autosave: trigger first create 700ms after label is non-empty
  useEffect(() => {
    if (createdRef.current || !values.label.trim()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!createdRef.current && values.label.trim()) {
        createdRef.current = true
        mutation.mutate(values)
      }
    }, 700)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.label, values.description, values.icon, values.position, values.capability, values.parent])

  return (
    <PanelShell title="New Package" sub={`extension: ${extensionKey}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className={lbl}>Label <span className="text-red-400">*</span></label>
          <input {...register('label')} autoFocus className={inp} placeholder="My Package" />
        </div>
        <PackageFields register={register} />
        <div className="pt-1">
          <SaveStatus
            saving={mutation.isPending}
            error={mutation.isError ? (mutation.error as Error).message : null}
          />
        </div>
      </form>
    </PanelShell>
  )
}

// ─── Edit panel ────────────────────────────────────────────────────────────

function EditPanel({ packageKey, onClose, onDeleted }: Extract<PackagePanelProps, { mode: 'edit' }>) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { register, reset, watch } = useForm<FormValues>({
    defaultValues: { label: '', description: '', icon: 'dashicons-admin-generic', position: 20, capability: 'manage_options', parent: '' },
  })
  const values = watch()
  const initialisedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data } = useQuery<{ package: { label: string; description: string; icon: string; position: number; capability: string; parent: string | null; extension_key: string } }>({
    queryKey: ['packages', packageKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!packageKey,
  })

  // Populate form once data arrives
  useEffect(() => {
    if (!data?.package) return
    const p = data.package
    reset({ label: p.label ?? '', description: p.description ?? '', icon: p.icon ?? 'dashicons-admin-generic', position: p.position ?? 20, capability: p.capability ?? 'manage_options', parent: p.parent ?? '' })
    initialisedRef.current = true
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ label: v.label.trim(), description: v.description.trim(), icon: v.icon || 'dashicons-admin-generic', position: v.position || 20, capability: v.capability || 'manage_options', parent: v.parent.trim() || null }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to save')
      return json
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), { method: 'DELETE', headers: authHeaders() })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      onDeleted()
    },
  })

  // Autosave: 700ms debounce after any field change, but only after initial populate
  useEffect(() => {
    if (!initialisedRef.current || !values.label?.trim()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveMutation.mutate(values), 700)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.label, values.description, values.icon, values.position, values.capability, values.parent])

  return (
    <PanelShell title={data?.package?.label || packageKey} sub={packageKey} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className={lbl}>Label <span className="text-red-400">*</span></label>
          <input {...register('label')} className={inp} />
        </div>
        <PackageFields register={register} />
        <div className="pt-1">
          <SaveStatus
            saving={saveMutation.isPending}
            error={saveMutation.isError ? (saveMutation.error as Error).message : null}
          />
        </div>
      </form>

      {/* Admin URL */}
      <div className="mt-5 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 mb-1">Admin URL</p>
        <code className="text-[10px] text-zinc-400 font-mono break-all">
          admin.php?page=gateway-package-{packageKey}
        </code>
      </div>

      {/* Delete */}
      <div className="mt-5 pt-4 border-t border-zinc-800">
        <p className="text-xs font-medium text-red-400/80 mb-2">Danger zone</p>
        {deleteMutation.isError && (
          <p className="text-xs text-red-400 mb-2">{(deleteMutation.error as Error).message}</p>
        )}
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 disabled:opacity-50 text-xs text-white transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-1 rounded border border-red-900/60 text-red-400/70 hover:bg-red-950/40 text-xs transition-colors"
          >
            Delete Package
          </button>
        )}
      </div>
    </PanelShell>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────

export function PackagePanel(props: PackagePanelProps) {
  if (props.mode === 'create') return <CreatePanel {...props} />
  return <EditPanel {...props} />
}
