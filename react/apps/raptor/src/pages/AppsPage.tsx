import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'

type AssignedPage = {
  id: number
  title: string
  permalink: string
  slug: string
}

type AppEntry = {
  key: string
  label: string
  template_slug: string
  mount_id: string
  localize_key: string
  assigned_pages: AssignedPage[]
}

export default function AppsPage() {
  const { data: apps = [], isLoading, isError } = useQuery<AppEntry[]>({
    queryKey: ['registered-apps'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/apps'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.apps as AppEntry[]
    },
    staleTime: 30_000,
  })

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h1 className="text-sm font-semibold text-zinc-300">Apps</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isLoading ? 'Loading…' : `${apps.length} app${apps.length !== 1 ? 's' : ''} registered`}
          </p>
        </div>

        {isLoading && (
          <div className="text-xs text-zinc-500 py-8 text-center">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-red-400 py-8 text-center">Failed to load apps.</div>
        )}
        {!isLoading && !isError && apps.length === 0 && (
          <div className="text-xs text-zinc-600 py-8 text-center">No apps registered.</div>
        )}

        {!isLoading && !isError && apps.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Registered</span>
              <span className="text-[10px] text-zinc-600">{apps.length}</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {apps.map((app) => (
                <div key={app.key} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{app.label}</p>
                      <code className="text-[10px] text-zinc-500 font-mono">{app.key}</code>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        app.assigned_pages.length > 0
                          ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
                          : 'text-zinc-500 bg-zinc-800/50 border-zinc-700/40'
                      }`}>
                        {app.assigned_pages.length > 0 ? `${app.assigned_pages.length} page${app.assigned_pages.length !== 1 ? 's' : ''}` : 'not assigned'}
                      </span>
                    </div>
                  </div>

                  {app.assigned_pages.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {app.assigned_pages.map((page) => (
                        <div key={page.id} className="flex items-center gap-2 text-[11px]">
                          <span className="text-zinc-600">↳</span>
                          <span className="text-zinc-400">{page.title}</span>
                          <code className="text-zinc-600 font-mono">{page.slug}</code>
                          <a
                            href={page.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-zinc-400 ml-auto"
                          >
                            ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-zinc-600 uppercase tracking-wider">Template</span>
                      <code className="text-zinc-500 font-mono">{app.template_slug}</code>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-zinc-600 uppercase tracking-wider">Mount</span>
                      <code className="text-zinc-500 font-mono">#{app.mount_id}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
