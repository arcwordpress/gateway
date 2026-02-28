import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

type Extension = {
  key: string
  title: string
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="text-gray-600 group-hover:text-gray-300 transition-colors"
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
      const res = await fetch(apiUrl('gateway/v1/extensions'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions ?? []
    },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Extensions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your Gateway plugin extensions
          </p>
        </div>

        <Link
          to="/extensions/create"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
        >
          <span className="text-base leading-none">+</span>
          New Extension
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
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
          <p className="text-gray-500 text-sm mb-4">No extensions yet</p>
          <Link
            to="/extensions/create"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition-colors"
          >
            Create your first extension
          </Link>
        </div>
      )}

      {!isLoading && !isError && extensions.length > 0 && (
        <div className="space-y-2">
          {extensions.map((ext) => (
            <div
              key={ext.key}
              className="group flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 group-hover:text-gray-100">
                  {ext.title || ext.key}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 font-mono">{ext.key}</p>
              </div>
              <ArrowIcon />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
