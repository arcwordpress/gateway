import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

type Extension = {
  extension_key: string
  title: string
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="text-zinc-600 group-hover:text-zinc-300 transition-colors"
    >
      <path d="M0.5 7.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 0.5L14.5 7.5L7.5 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Extensions() {
  const { data: extensions = [], isLoading, isError } = useQuery<Extension[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions ?? []
    },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Extensions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage your Gateway plugin extensions
          </p>
        </div>

        <Link
          to={"/extensions/create" as never}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-white font-medium transition-colors"
        >
          <span className="text-base leading-none">+</span>
          New Extension
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load extensions. Check that the Gateway REST API is reachable.
        </div>
      )}

      {!isLoading && !isError && extensions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4 opacity-30">⬡</div>
          <p className="text-zinc-500 text-sm mb-4">No extensions yet</p>
          <Link
            to={"/extensions/create" as never}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-white transition-colors"
          >
            Create your first extension
          </Link>
        </div>
      )}

      {!isLoading && !isError && extensions.length > 0 && (
        <div className="space-y-2">
          {extensions.map((ext) => (
            <Link
              key={ext.extension_key}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={`/extensions/${ext.extension_key}/edit` as any}
              className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-200 group-hover:text-zinc-100">
                  {ext.title || ext.extension_key}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 font-mono">{ext.extension_key}</p>
              </div>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
