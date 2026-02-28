import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

function toKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function ExtensionCreate() {
  const [title, setTitle] = useState('')
  const [key, setKey] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Auto-generate key from title (same logic as Exta)
  useEffect(() => {
    if (title) setKey(toKey(title))
  }, [title])

  const mutation = useMutation({
    mutationFn: async (data: { title: string; key: string }) => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.message ?? 'Failed to create extension')
      }
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      void navigate({ to: '/extensions' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !key.trim()) return
    mutation.mutate({ title: title.trim(), key: key.trim() })
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          to="/extensions"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-gray-100 mt-3">New Extension</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creates a new Gateway plugin extension with its own data structure.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="ext-title" className="block text-sm font-medium text-gray-300 mb-1.5">
              Title
            </label>
            <input
              id="ext-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Extension"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              autoFocus
              disabled={mutation.isPending}
            />
          </div>

          <div>
            <label htmlFor="ext-key" className="block text-sm font-medium text-gray-300 mb-1.5">
              Key
              <span className="ml-2 text-xs text-gray-600 font-normal">auto-generated</span>
            </label>
            <input
              id="ext-key"
              type="text"
              value={key}
              readOnly
              className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-500 font-mono text-sm focus:outline-none cursor-default"
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
              disabled={mutation.isPending || !title.trim()}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {mutation.isPending ? 'Creating…' : 'Create Extension'}
            </button>

            <Link
              to="/extensions"
              className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
