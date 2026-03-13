import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Helpers ───────────────────────────────────────────────────────────────

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 ' +
  'placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50'

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ExtensionCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [version, setVersion]           = useState('1.0.0')
  const [author, setAuthor]             = useState('')
  const [authorUri, setAuthorUri]       = useState('')
  const [minWpVersion, setMinWpVersion] = useState('6.0')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          description,
          version,
          author,
          author_uri: authorUri,
          min_wp_version: minWpVersion,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      void navigate({ to: '/extensions' })
    },
  })

  const isBusy = mutation.isPending

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 mt-3">New Extension</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
          className="space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              autoFocus
              disabled={isBusy}
              onChange={(e) => setTitle(e.target.value)}
              className={baseInput}
              placeholder="Ticketify"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              disabled={isBusy}
              onChange={(e) => setDescription(e.target.value)}
              className={baseInput}
            />
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Version</label>
            <input
              type="text"
              value={version}
              disabled={isBusy}
              onChange={(e) => setVersion(e.target.value)}
              className={baseInput}
              placeholder="1.0.0"
            />
          </div>

          {/* Author + Author URI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Author</label>
              <input
                type="text"
                value={author}
                disabled={isBusy}
                onChange={(e) => setAuthor(e.target.value)}
                className={baseInput}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Author URI</label>
              <input
                type="text"
                value={authorUri}
                disabled={isBusy}
                onChange={(e) => setAuthorUri(e.target.value)}
                className={baseInput}
                placeholder="https://"
              />
            </div>
          </div>

          {/* Min WP Version */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Min WP Version</label>
            <input
              type="text"
              value={minWpVersion}
              disabled={isBusy}
              onChange={(e) => setMinWpVersion(e.target.value)}
              className={baseInput}
              placeholder="6.0"
            />
          </div>

          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isBusy || !title.trim()}
              className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isBusy ? 'Creating…' : 'Create Extension'}
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
    </div>
  )
}
