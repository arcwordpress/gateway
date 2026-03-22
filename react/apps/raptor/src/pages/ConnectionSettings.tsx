import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'

export default function ConnectionSettings() {
  const [driver, setDriver] = useState(appConfig.dbDriver)
  const [port, setPort] = useState(appConfig.connectionPort)
  const [saved, setSaved] = useState(false)

  const saveMutation = useMutation({
    mutationFn: async (data: { db_driver: string; connection_port: string }) => {
      const response = await fetch(apiUrl('gateway/v1/settings/connection'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? 'Failed to save')
      }
      return response.json()
    },
    onSuccess: () => {
      setSaved(true)
    },
  })

  const handleSave = () => {
    setSaved(false)
    saveMutation.mutate({ db_driver: driver, connection_port: port })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-100">Database Connection</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-6">
          {/* DB not ready banner */}
          {!appConfig.dbReady && (
            <div className="rounded-md bg-amber-900/40 border border-amber-700/50 px-4 py-3 text-sm text-amber-300">
              Gateway database tables are not yet initialised. Configure your connection
              below and reload the page to connect.
            </div>
          )}

          {/* Driver */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Database Driver
            </label>
            <div className="flex gap-3">
              {(['mysql', 'sqlite'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDriver(d)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    driver === d
                      ? 'bg-zinc-700 text-zinc-100 ring-1 ring-zinc-500'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {d === 'mysql' ? 'MySQL' : 'SQLite'}
                </button>
              ))}
            </div>
          </div>

          {/* Port (MySQL only) */}
          {driver === 'mysql' && (
            <div className="space-y-2">
              <label htmlFor="connection-port" className="block text-sm font-medium text-zinc-300">
                Port{' '}
                <span className="text-zinc-500 font-normal">(leave blank for default 3306)</span>
              </label>
              <input
                id="connection-port"
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3306"
                className="w-48 rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-sm font-medium text-zinc-100 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>

            {saved && !saveMutation.isPending && (
              <span className="text-sm text-zinc-300">
                Saved — reload the page to connect.
              </span>
            )}

            {saveMutation.isError && (
              <span className="text-sm text-red-400">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : 'Save failed'}
              </span>
            )}
          </div>

          {saved && !saveMutation.isPending && (
            <div className="rounded-md bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-300">
              Reload this page to apply the new connection settings.{' '}
              <button
                onClick={() => window.location.reload()}
                className="underline text-zinc-100 hover:text-white"
              >
                Reload now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
