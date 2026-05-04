import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useParams } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Types ─────────────────────────────────────────────────────────────────

type Extension = {
  extension_key: string
  title: string
  description: string
  version: string
  author: string
  author_uri: string
  min_wp_version: string
  namespace: string
  status: string
}

type Collection = {
  id: number
  collection_key: string
  title: string
}

type BuildResult = {
  success: boolean
  plugin_slug?: string
  collection_count?: number
  collections?: { collection_key: string; class_generated: boolean; migration: { success: boolean } }[]
  error?: string
}

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 ' +
  'placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50'

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ExtensionEdit() {
  const { key } = useParams({ strict: false }) as { key: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [version, setVersion]           = useState('')
  const [author, setAuthor]             = useState('')
  const [authorUri, setAuthorUri]       = useState('')
  const [minWpVersion, setMinWpVersion] = useState('')
  const [namespace, setNamespace]       = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [buildResult, setBuildResult]   = useState<BuildResult | null>(null)

  // ── Load extension + collections ──────────────────────────────────────

  const { data: extensionData, isLoading, isError } = useQuery<{
    extension: Extension
    collections: Collection[]
  }>({
    queryKey: ['extensions', key],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${key}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!key,
  })

  const { extension, collections = [] } = extensionData ?? {}

  useEffect(() => {
    if (!extension) return
    setTitle(extension.title ?? '')
    setDescription(extension.description ?? '')
    setVersion(extension.version ?? '')
    setAuthor(extension.author ?? '')
    setAuthorUri(extension.author_uri ?? '')
    setMinWpVersion(extension.min_wp_version ?? '')
    setNamespace(extension.namespace ?? '')
  }, [extension])

  // ── Update ────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${key}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ title, description, version, author, author_uri: authorUri, min_wp_version: minWpVersion, namespace }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
    },
  })

  // ── Build ─────────────────────────────────────────────────────────────

  const buildMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${key}/build`), {
        method: 'POST',
        headers: authHeaders(),
      })
      return res.json() as Promise<BuildResult>
    },
    onSuccess: (result) => {
      setBuildResult(result)
    },
  })

  // ── Delete ────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${key}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete extension')
      return json
    },
    onSuccess: () => {
      // Invalidate every cache that holds extension or collection data so
      // diagram nodes, stats, and collection lists don't show stale records.
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      queryClient.invalidateQueries({ queryKey: ['raptor-extensions'] })
      queryClient.invalidateQueries({ queryKey: ['raptor-extension', key] })
      queryClient.invalidateQueries({ queryKey: ['raptor-collections'] })
      queryClient.invalidateQueries({ queryKey: ['raptor-collections-nested'] })
      queryClient.invalidateQueries({ queryKey: ['raptor-admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['extension-fields'] })
      void navigate({ to: '/extensions' })
    },
  })

  const isBusy = updateMutation.isPending || deleteMutation.isPending || buildMutation.isPending

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 mt-3">
          {extension?.title || key}
        </h1>
        <p className="text-xs text-zinc-600 font-mono mt-0.5">{key}</p>
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-sm">
          Could not load extension data.
        </div>
      )}

      {/* ── Collections ─────────────────────────────────────────────────── */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400">Collections</h2>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link to={`/extensions/${key}/collections` as any} className="text-xs text-zinc-300 hover:text-zinc-100 transition-colors">
            Manage →
          </Link>
        </div>
        {!isLoading && collections.length > 0 && (
          <ul className="space-y-1">
            {collections.map((c) => (
              <li key={c.collection_key}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link
                  to={`/extensions/${key}/collections/${c.collection_key}/fields` as any}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-zinc-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                  {c.title || c.collection_key}
                  <span className="ml-auto text-xs text-zinc-600 font-mono">{c.collection_key}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && collections.length === 0 && (
          <p className="text-xs text-zinc-600">No collections yet.</p>
        )}
      </div>

      {/* ── Edit form ────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); updateMutation.mutate() }}
          className="space-y-5"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
                <div className="h-9 rounded-lg bg-zinc-800 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title <span className="text-red-300/70">*</span></label>
                <input type="text" value={title} disabled={isBusy} onChange={(e) => setTitle(e.target.value)} className={baseInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <input type="text" value={description} disabled={isBusy} onChange={(e) => setDescription(e.target.value)} className={baseInput} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Version</label>
                  <input type="text" value={version} disabled={isBusy} onChange={(e) => setVersion(e.target.value)} className={baseInput} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Min WP Version</label>
                  <input type="text" value={minWpVersion} disabled={isBusy} onChange={(e) => setMinWpVersion(e.target.value)} className={baseInput} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Author</label>
                  <input type="text" value={author} disabled={isBusy} onChange={(e) => setAuthor(e.target.value)} className={baseInput} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Author URI</label>
                  <input type="text" value={authorUri} disabled={isBusy} onChange={(e) => setAuthorUri(e.target.value)} className={baseInput} placeholder="https://" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  PHP Namespace
                  <span className="ml-2 text-xs text-zinc-600 font-normal">auto-derived if blank</span>
                </label>
                <input type="text" value={namespace} disabled={isBusy} onChange={(e) => setNamespace(e.target.value)} className={baseInput} placeholder="MyExtension" />
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
              disabled={isBusy || !title.trim() || isLoading}
              className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              to="/extensions"
              className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* ── Build ────────────────────────────────────────────────────────── */}
      <div className="mt-6 p-5 rounded-xl border border-zinc-700 bg-zinc-900">
        <p className="text-sm font-medium text-zinc-200 mb-1">Build Plugin</p>
        <p className="text-xs text-zinc-500 mb-4">
          Generates PHP collection classes and database migrations for all collections in this
          extension, then writes them to{' '}
          <code className="font-mono text-zinc-400">wp-content/plugins/{key?.replace(/_/g, '-')}</code>.
        </p>

        {buildResult && (
          <div className={`mb-4 p-3 rounded-lg text-xs border ${
            buildResult.success
              ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300'
              : 'bg-red-950/50 border-red-900 text-red-300'
          }`}>
            {buildResult.success ? (
              <>
                <p className="font-medium mb-1">Build successful — {buildResult.collection_count} collection(s) compiled.</p>
                {buildResult.collections?.map((c) => (
                  <p key={c.collection_key} className="opacity-80">
                    {c.collection_key}: class {c.class_generated ? '✓' : '✗'} · migration {c.migration?.success ? '✓' : '✗'}
                  </p>
                ))}
              </>
            ) : (
              <p>{buildResult.error ?? 'Build failed.'}</p>
            )}
          </div>
        )}

        {buildMutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-xs">
            {(buildMutation.error as Error).message}
          </div>
        )}

        <button
          onClick={() => { setBuildResult(null); buildMutation.mutate() }}
          disabled={isBusy}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {buildMutation.isPending ? 'Building…' : 'Build Extension'}
        </button>
      </div>

      {/* ── Delete ────────────────────────────────────────────────────────── */}
      <div className="mt-4 p-4 rounded-xl border border-red-900/50 bg-red-950/20">
        <p className="text-sm font-medium text-red-300 mb-1">Danger zone</p>
        <p className="text-xs text-zinc-500 mb-3">
          Deletes this extension record and its generated plugin directory. This cannot be undone.
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
            Delete Extension
          </button>
        )}
      </div>
    </div>
  )
}