import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useParams } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

type Package = {
  package_key: string
  label: string
  description: string
  icon: string
  position: number
  capability: string
  parent: string | null
  status: string
}

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 ' +
  'placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50'

export default function PackageEdit() {
  const { packageKey } = useParams({ strict: false }) as { packageKey: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [label, setLabel]           = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon]             = useState('dashicons-admin-generic')
  const [position, setPosition]     = useState('20')
  const [capability, setCapability] = useState('manage_options')
  const [parent, setParent]         = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // ── Load package ─────────────────────────────────────────────────────

  const { data: packageData, isLoading, isError } = useQuery<{ package: Package }>({
    queryKey: ['packages', packageKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!packageKey,
  })

  const pkg = packageData?.package

  useEffect(() => {
    if (!pkg) return
    setLabel(pkg.label ?? '')
    setDescription(pkg.description ?? '')
    setIcon(pkg.icon ?? 'dashicons-admin-generic')
    setPosition(String(pkg.position ?? 20))
    setCapability(pkg.capability ?? 'manage_options')
    setParent(pkg.parent ?? '')
  }, [pkg])

  // ── Update ────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          label,
          description,
          icon,
          position: parseInt(position, 10) || 20,
          capability,
          parent: parent || null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update package')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
  })

  // ── Delete ────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/package/${packageKey}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete package')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      void navigate({ to: '/packages' as never })
    },
  })

  const isBusy = updateMutation.isPending || deleteMutation.isPending

  // WordPress admin menu URL for this package
  const adminUrl = pkg
    ? `${(window as Window & { wpAdminUrl?: string }).wpAdminUrl ?? '/wp-admin/'}admin.php?page=gateway-package-${pkg.package_key}`
    : null

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to={'/packages' as never} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Packages
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 mt-3">
          {pkg?.label || packageKey}
        </h1>
        <p className="text-xs text-zinc-600 font-mono mt-0.5">{packageKey}</p>
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-sm">
          Could not load package data.
        </div>
      )}

      {/* ── Admin URL ────────────────────────────────────────────────────── */}
      {adminUrl && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-400 mb-2">Admin Menu URL</p>
          <p className="text-xs text-zinc-500 mb-3">
            This is the unique WordPress admin URL for this package. Collections assigned to this package appear here.
          </p>
          <a
            href={adminUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-mono transition-colors"
          >
            {adminUrl}
            <svg width="11" height="11" viewBox="0 0 15 15" fill="none" className="opacity-50">
              <path d="M3 2H13V12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 2L2 13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}

      {/* ── Edit form ────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); updateMutation.mutate() }}
          className="space-y-5"
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
                <div className="h-9 rounded-lg bg-zinc-800 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Label <span className="text-red-300/70">*</span>
                </label>
                <input type="text" value={label} disabled={isBusy} onChange={(e) => setLabel(e.target.value)} className={baseInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <input type="text" value={description} disabled={isBusy} onChange={(e) => setDescription(e.target.value)} className={baseInput} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Icon</label>
                  <input type="text" value={icon} disabled={isBusy} onChange={(e) => setIcon(e.target.value)} className={baseInput} placeholder="dashicons-admin-generic" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Menu Position</label>
                  <input type="number" value={position} disabled={isBusy} onChange={(e) => setPosition(e.target.value)} className={baseInput} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Capability</label>
                <input type="text" value={capability} disabled={isBusy} onChange={(e) => setCapability(e.target.value)} className={baseInput} placeholder="manage_options" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Parent Menu Slug
                  <span className="ml-2 text-xs text-zinc-600 font-normal">blank = top-level</span>
                </label>
                <input type="text" value={parent} disabled={isBusy} onChange={(e) => setParent(e.target.value)} className={baseInput} placeholder="options-general.php" />
              </div>
            </>
          )}

          {updateMutation.isError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-sm">
              {(updateMutation.error as Error).message}
            </div>
          )}
          {updateMutation.isSuccess && (
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-sm">
              Saved.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isBusy || !label.trim() || isLoading}
              className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              to={'/packages' as never}
              className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* ── Delete ────────────────────────────────────────────────────────── */}
      <div className="mt-4 p-4 rounded-xl border border-red-900/50 bg-red-950/20">
        <p className="text-sm font-medium text-red-300 mb-1">Danger zone</p>
        <p className="text-xs text-zinc-500 mb-3">
          Deletes this package record. Collections that reference this package key will revert to the default package.
        </p>

        {deleteMutation.isError && (
          <p className="text-xs text-red-300 mb-2">{(deleteMutation.error as Error).message}</p>
        )}

        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={isBusy}
              className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 disabled:opacity-50 text-zinc-100 text-sm font-medium transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isBusy}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-1.5 rounded-lg border border-red-900/60 text-red-300/80 hover:bg-red-950/50 text-sm transition-colors"
          >
            Delete Package
          </button>
        )}
      </div>
    </div>
  )
}
