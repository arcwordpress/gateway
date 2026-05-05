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

type CollectionStatus = {
  collection_key: string
  title: string
  status: string
  is_assigned: boolean
  other_packages: string[]
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

// ─── Collections tab ───────────────────────────────────────────────────────

function CollectionsTab({ packageKey }: { packageKey: string }) {
  const queryClient = useQueryClient()
  // Local optimistic state so toggling feels instant
  const [localAssigned, setLocalAssigned] = useState<string[] | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading } = useQuery<{ success: boolean; collections: CollectionStatus[] }>({
    queryKey: ['package-collections', packageKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}/collections`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!packageKey,
  })

  const mutation = useMutation({
    mutationFn: async (collectionKeys: string[]) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}/collections`), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ collection_keys: collectionKeys }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to save')
      return json
    },
    onSuccess: () => {
      setLocalAssigned(null)
      queryClient.invalidateQueries({ queryKey: ['package-collections', packageKey] })
      queryClient.invalidateQueries({ queryKey: ['packages', packageKey] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
    onError: () => setLocalAssigned(null),
  })

  const collections = data?.collections ?? []
  const serverAssigned = collections.filter((c) => c.is_assigned).map((c) => c.collection_key)
  const assigned = localAssigned ?? serverAssigned
  const hasNone = !isLoading && assigned.length === 0

  const toggle = (key: string) => {
    const next = assigned.includes(key)
      ? assigned.filter((k) => k !== key)
      : [...assigned, key]
    setLocalAssigned(next)
    // Debounce the actual save so rapid toggles don't each trigger a rebuild
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => mutation.mutate(next), 600)
  }

  if (isLoading) {
    return <p className="text-xs text-zinc-500 py-4">Loading collections…</p>
  }

  if (collections.length === 0) {
    return (
      <p className="text-xs text-zinc-500 py-4">
        No collections found for this extension. Create collections first, then assign them here.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {/* Warning when no collections assigned */}
      {hasNone && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-800/60 bg-amber-950/40 px-3 py-2">
          <span className="mt-0.5 text-amber-400 text-xs">⚠</span>
          <p className="text-xs text-amber-300/90">
            This package has no collections assigned. Assign at least one collection so it has content to display.
          </p>
        </div>
      )}

      {mutation.isError && (
        <p className="mb-2 text-xs text-red-400">{(mutation.error as Error).message}</p>
      )}

      {collections.map((col) => {
        const isAssigned = assigned.includes(col.collection_key)
        return (
        <label
          key={col.collection_key}
          className={`group flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
            isAssigned
              ? 'border-zinc-600 bg-zinc-800/60'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
          } ${col.status === 'inactive' ? 'opacity-50' : ''}`}
        >
          <div className="mt-0.5 flex-shrink-0">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isAssigned
                  ? 'border-zinc-400 bg-zinc-600'
                  : 'border-zinc-600 bg-zinc-900 group-hover:border-zinc-500'
              }`}
            >
              {isAssigned && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={isAssigned}
            onChange={() => toggle(col.collection_key)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 leading-tight">{col.title || col.collection_key}</p>
            <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{col.collection_key}</p>
            {col.other_packages.length > 0 && (
              <p className="mt-1 text-[10px] text-zinc-500">
                Also in:{' '}
                {col.other_packages.map((pk, i) => (
                  <span key={pk}>
                    <span className="text-zinc-400 font-mono">{pk}</span>
                    {i < col.other_packages.length - 1 && ', '}
                  </span>
                ))}
              </p>
            )}
          </div>
          {col.status === 'inactive' && (
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 mt-0.5">inactive</span>
          )}
        </label>
        )
      })}
    </div>
  )
}

// ─── Create panel ──────────────────────────────────────────────────────────

function CreatePanel({ extensionId, extensionTitle, onClose, onCreated }: Extract<PackagePanelProps, { mode: 'create' }>) {
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
          extension_id:  extensionId,
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
    <PanelShell title="New Package" sub={extensionTitle} onClose={onClose}>
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

type EditTab = 'settings' | 'collections'

function EditPanel({ packageKey, onClose, onDeleted, onKeyChange }: Extract<PackagePanelProps, { mode: 'edit' }>) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<EditTab>('settings')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { register, reset, watch } = useForm<FormValues>({
    defaultValues: { label: '', package_key: '', description: '', icon: 'dashicons-admin-generic', position: 20, capability: 'manage_options', parent: '' },
  })
  const values = watch()
  const initialisedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data } = useQuery<{ package: { package_key: string; label: string; description: string; icon: string; position: number; capability: string; parent: string | null; extension_id: number | null; has_collections: boolean; collection_keys: string[] } }>({
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
    reset({ label: p.label ?? '', package_key: p.package_key ?? '', description: p.description ?? '', icon: p.icon ?? 'dashicons-admin-generic', position: p.position ?? 20, capability: p.capability ?? 'manage_options', parent: p.parent ?? '' })
    initialisedRef.current = true
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ label: v.label.trim(), package_key: v.package_key.trim() || undefined, description: v.description.trim(), icon: v.icon || 'dashicons-admin-generic', position: v.position || 20, capability: v.capability || 'manage_options', parent: v.parent.trim() || null }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to save')
      return json
    },
    onSuccess: (json) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      const newKey = json.package?.package_key
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

  // Autosave: 700ms debounce after any field change, but only after initial populate
  useEffect(() => {
    if (!initialisedRef.current || !values.label?.trim()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveMutation.mutate(values), 700)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.label, values.package_key, values.description, values.icon, values.position, values.capability, values.parent])

  const hasNoCollections = data?.package && !data.package.has_collections

  return (
    <PanelShell title={data?.package?.label || packageKey} sub={packageKey} onClose={onClose}>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-zinc-800 -mx-1 mb-4">
        {(['settings', 'collections'] as EditTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
            {t === 'collections' && hasNoCollections && (
              <span className="ml-1.5 inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-amber-400 align-middle" />
            )}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-300" />
            )}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === 'settings' && (
        <>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className={lbl}>Label <span className="text-red-400">*</span></label>
              <input {...register('label')} className={inp} />
            </div>
            <div>
              <label className={lbl}>Key</label>
              <input {...register('package_key')} className={`${inp} font-mono`} />
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
        </>
      )}

      {/* Collections tab */}
      {tab === 'collections' && (
        <CollectionsTab packageKey={packageKey} />
      )}
    </PanelShell>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────

export function PackagePanel(props: PackagePanelProps) {
  if (props.mode === 'create') return <CreatePanel {...props} />
  return <EditPanel {...props} />
}
