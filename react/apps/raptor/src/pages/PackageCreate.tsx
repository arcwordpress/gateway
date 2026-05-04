import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 ' +
  'placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50'

export default function PackageCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [label, setLabel]           = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon]             = useState('dashicons-admin-generic')
  const [position, setPosition]     = useState('20')
  const [capability, setCapability] = useState('manage_options')
  const [parent, setParent]         = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/package'), {
        method: 'POST',
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
      if (!json.success) throw new Error(json.message ?? 'Failed to create package')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      void navigate({ to: '/packages' as never })
    },
  })

  const isBusy = mutation.isPending

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to={'/packages' as never} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Packages
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 mt-3">New Package</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Creates the equivalent of <code className="font-mono text-zinc-400">class MyPackage extends Package</code>
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
          className="space-y-5"
        >
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              autoFocus
              disabled={isBusy}
              onChange={(e) => setLabel(e.target.value)}
              className={baseInput}
              placeholder="My Package"
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

          {/* Icon + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Icon</label>
              <input
                type="text"
                value={icon}
                disabled={isBusy}
                onChange={(e) => setIcon(e.target.value)}
                className={baseInput}
                placeholder="dashicons-admin-generic"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Menu Position</label>
              <input
                type="number"
                value={position}
                disabled={isBusy}
                onChange={(e) => setPosition(e.target.value)}
                className={baseInput}
                placeholder="20"
              />
            </div>
          </div>

          {/* Capability */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Capability</label>
            <input
              type="text"
              value={capability}
              disabled={isBusy}
              onChange={(e) => setCapability(e.target.value)}
              className={baseInput}
              placeholder="manage_options"
            />
          </div>

          {/* Parent menu slug */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Parent Menu Slug
              <span className="ml-2 text-xs text-zinc-600 font-normal">leave blank for top-level</span>
            </label>
            <input
              type="text"
              value={parent}
              disabled={isBusy}
              onChange={(e) => setParent(e.target.value)}
              className={baseInput}
              placeholder="options-general.php"
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
              disabled={isBusy || !label.trim()}
              className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isBusy ? 'Creating…' : 'Create Package'}
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
    </div>
  )
}
