import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import PanelShell from '../components/ui/PanelShell'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Types ─────────────────────────────────────────────────────────────────

type FormValues = {
  label: string
  package_key: string
  description: string
  icon: string
  position: number
  capability: string
  parent: string
}

export type PackagePanelProps =
  | { mode: 'create'; extensionId: number; extensionTitle: string; onClose: () => void; onCreated: (key: string) => void }
  | { mode: 'edit'; packageKey: string; onClose: () => void; onDeleted: () => void; onKeyChange?: (newKey: string) => void }

// ─── Styles ────────────────────────────────────────────────────────────────

const inp =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-40 text-sm'

const lbl = 'block text-xs font-medium text-zinc-400 mb-1'

// ─── Helpers ───────────────────────────────────────────────────────────────

function labelToKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 200)
}

// ─── Save status indicator ─────────────────────────────────────────────────

function SaveStatus({ saving, error }: { saving: boolean; error: string | null }) {
  if (error) return <span className="text-red-400 text-[10px]">{error}</span>
  if (saving) return <span className="text-zinc-500 text-[10px]">Saving…</span>
  return <span className="text-zinc-600 text-[10px]">Autosaved</span>
}

// ─── Shared fields ─────────────────────────────────────────────────────────

function PackageFields({ register, disabled }: { register: ReturnType<typeof useForm<FormValues>>['register']; disabled?: boolean }) {
  return (
    <>
      <div>
        <label className={lbl}>Description</label>
        <input {...register('description')} className={inp} disabled={disabled} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Icon</label>
          <input {...register('icon')} className={inp} placeholder="dashicons-admin-generic" disabled={disabled} />
        </div>
        <div>
          <label className={lbl}>Position</label>
          <input {...register('position', { valueAsNumber: true })} type="number" className={inp} disabled={disabled} />
        </div>
      </div>
      <div>
        <label className={lbl}>Capability</label>
        <input {...register('capability')} className={inp} placeholder="manage_options" disabled={disabled} />
      </div>
      <div>
        <label className={lbl}>
          Parent menu slug
          <span className="ml-1 text-zinc-600 font-normal">blank = top-level</span>
        </label>
        <input {...register('parent')} className={inp} placeholder="options-general.php" disabled={disabled} />
      </div>
    </>
  )
}

// ─── Create panel ──────────────────────────────────────────────────────────

function CreatePanel({ extensionId, extensionTitle, onClose, onCreated }: Extract<PackagePanelProps, { mode: 'create' }>) {
  const queryClient = useQueryClient()
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: { label: '', package_key: '', description: '', icon: 'dashicons-admin-generic', position: 20, capability: 'manage_options', parent: '' },
  })
  const values = watch()
  const createdRef = useRef(false)
  const keyEditedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-generate key from label unless the user has manually edited the key field.
  useEffect(() => {
    if (!keyEditedRef.current) {
      setValue('package_key', labelToKey(values.label), { shouldDirty: false })
    }
  }, [values.label, setValue])

  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/package'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          extension_id:  extensionId,
          package_key:   v.package_key.trim(),
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
    onError: () => {
      createdRef.current = false
    },
  })

  // Autosave: trigger first create 700ms after label + key are both non-empty.
  useEffect(() => {
    if (createdRef.current || !values.label.trim() || !values.package_key.trim()) return
    if (!extensionId || extensionId <= 0) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!createdRef.current && values.label.trim() && values.package_key.trim()) {
        createdRef.current = true
        mutation.mutate(values)
      }
    }, 700)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.label, values.package_key, values.description, values.icon, values.position, values.capability, values.parent])

  return (
    <PanelShell title="New Package" sub={extensionTitle} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className={lbl}>Label <span className="text-red-400">*</span></label>
          <input {...register('label')} autoFocus className={inp} placeholder="My Package" />
        </div>
        <div>
          <label className={lbl}>
            Key <span className="text-red-400">*</span>
            <span className="ml-1.5 text-zinc-600 font-mono font-normal">lowercase, hyphens, underscores</span>
          </label>
          <input
            {...register('package_key')}
            className={`${inp} font-mono`}
            placeholder="my-package"
            onChange={(e) => {
              keyEditedRef.current = true
              setValue('package_key', e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''), { shouldDirty: true })
            }}
          />
        </div>
        <PackageFields register={register} disabled={mutation.isPending} />
        <div className="pt-1">
          {!extensionId || extensionId <= 0
            ? <span className="text-amber-400 text-[10px]">No extension selected — select an extension before creating a package.</span>
            : <SaveStatus saving={mutation.isPending} error={mutation.isError ? (mutation.error as Error).message : null} />
          }
        </div>
      </form>
    </PanelShell>
  )
}

// ─── Edit panel ────────────────────────────────────────────────────────────

function EditPanel({ packageKey, onClose, onDeleted, onKeyChange }: Extract<PackagePanelProps, { mode: 'edit' }>) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { register, reset, watch, formState } = useForm<FormValues>({
    defaultValues: { label: '', package_key: '', description: '', icon: 'dashicons-admin-generic', position: 20, capability: 'manage_options', parent: '' },
  })
  const values = watch()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data } = useQuery<{ package: { package_key: string; label: string; description: string; icon: string; position: number; capability: string; parent: string | null; extension_id: number | null; has_collections: boolean; collection_keys: string[] } }>({
    queryKey: ['packages', packageKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!packageKey,
    staleTime: 30_000,
  })

  // Populate form once data arrives — reset marks form as pristine (isDirty = false)
  // so the autosave below does not fire on initial load.
  useEffect(() => {
    if (!data?.package) return
    const p = data.package
    reset({
      label: p.label ?? '',
      package_key: p.package_key ?? '',
      description: p.description ?? '',
      icon: p.icon ?? 'dashicons-admin-generic',
      position: p.position ?? 20,
      capability: p.capability ?? 'manage_options',
      parent: p.parent ?? '',
    })
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          label:       v.label.trim(),
          package_key: v.package_key.trim() || undefined,
          description: v.description.trim(),
          icon:        v.icon || 'dashicons-admin-generic',
          position:    v.position || 20,
          capability:  v.capability || 'manage_options',
          parent:      v.parent.trim() || null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to save')
      return json
    },
    onSuccess: (json) => {
      const updated = json.package
      // Update both the individual and list caches directly to avoid refetch loops.
      queryClient.setQueryData(['packages', updated.package_key], json)
      queryClient.setQueryData<{ package_key: string; label: string; icon: string; has_collections: boolean; collection_keys: string[]; extension_id: number | null }[]>(
        ['packages'],
        (old) => old?.map((p) => p.package_key === packageKey || p.package_key === updated.package_key ? { ...p, ...updated } : p)
      )
      const newKey = updated?.package_key
      if (newKey && newKey !== packageKey) {
        onKeyChange?.(newKey)
      }
    },
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

  // Autosave: only fires when the user has actually changed something (isDirty).
  useEffect(() => {
    if (!formState.isDirty || !values.label?.trim()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveMutation.mutate(values), 700)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.label, values.package_key, values.description, values.icon, values.position, values.capability, values.parent, formState.isDirty])

  return (
    <PanelShell title={data?.package?.label || packageKey} sub={packageKey} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className={lbl}>Label <span className="text-red-400">*</span></label>
          <input {...register('label')} className={inp} />
        </div>
        <div>
          <label className={lbl}>
            Key <span className="text-red-400">*</span>
            <span className="ml-1.5 text-zinc-600 font-mono font-normal">lowercase, hyphens, underscores</span>
          </label>
          <input
            {...register('package_key')}
            className={`${inp} font-mono`}
            onChange={(e) => {
              const clean = e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, '')
              register('package_key').onChange({ target: { value: clean, name: 'package_key' } })
            }}
          />
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
          admin.php?page=gateway-package-{values.package_key || packageKey}
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
