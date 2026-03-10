import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, ArrowLeftRight, Database, Layers, Eye, FileText } from 'lucide-react'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'
import type { Collection } from '../lib/object_types'

type AdminDataResponse = {
  collections?: Array<{ key?: string; routes?: unknown[] }>
  record_count?: number
}

type AdminStats = {
  totalCollections: number
  totalRoutes: number
  recordCount: number
}

const iconMap: Record<string, React.ReactNode> = {
  collections: <LayoutGrid className="w-5 h-5" />,
  routes: <ArrowLeftRight className="w-5 h-5" />,
  records: <Database className="w-5 h-5" />,
  fields: <Layers className="w-5 h-5" />,
  views: <Eye className="w-5 h-5" />,
  forms: <FileText className="w-5 h-5" />,
}

const quickActions = [
  { label: 'Collections', description: 'Browse and manage collections', icon: '⬡', to: '/collections' },
  { label: 'Fields', description: 'Open field builder across collections', icon: '◧', to: '/fields' },
  { label: 'Views', description: 'Open views builder across collections', icon: '◑', to: '/views' },
  { label: 'Forms', description: 'Open forms builder across collections', icon: '⬆', to: '/forms' },
]

export default function Dashboard() {
  const { data: adminStats, isLoading: isAdminStatsLoading } = useQuery<AdminStats>({
    queryKey: ['raptor-admin-stats'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) {
        return { totalCollections: 0, totalRoutes: 0, recordCount: 0 }
      }

      const data = await res.json() as AdminDataResponse

      // Keep parity with the existing admin app logic.
      const totalRoutes = (data.collections ?? []).reduce((sum, collection) => {
        return sum + (collection.routes ? collection.routes.length : 0)
      }, 0)

      return {
        totalCollections: data.collections?.length ?? 0,
        totalRoutes,
        recordCount: data.record_count ?? 0,
      }
    },
  })

  const { data: collections = [], isLoading, dataUpdatedAt } = useQuery<Collection[]>({
    queryKey: ['raptor-dashboard-summary'],
    queryFn: async () => {
      const listRes = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!listRes.ok) return []

      const listJson = await listRes.json() as {
        collections?: Array<{ collection_key: string }>
      }

      const items = listJson.collections ?? []
      if (items.length === 0) return []

      const details = await Promise.all(
        items.map(async (item) => {
          const detailRes = await fetch(
            apiUrl(`gateway/v1/raptor/collection/${item.collection_key}`),
            { headers: authHeaders() },
          )
          if (!detailRes.ok) return null
          const detailJson = await detailRes.json() as { collection?: Collection }
          return detailJson.collection ?? null
        }),
      )

      return details.filter((c): c is Collection => c !== null)
    },
  })

  const totalFields = collections.reduce((sum, collection) => sum + (collection.field_list?.fields.length ?? 0), 0)
  const totalViews = collections.reduce((sum, collection) => sum + (collection.view_list?.views.length ?? 0), 0)
  const totalForms = collections.reduce((sum, collection) => sum + (collection.form_list?.forms.length ?? 0), 0)

  const stats = [
    {
      label: 'Collections',
      value: String(adminStats?.totalCollections ?? 0),
      delta: 'All registered (code + UI)',
      iconKey: 'collections',
      isLoading: isAdminStatsLoading,
    },
    {
      label: 'Routes',
      value: String(adminStats?.totalRoutes ?? 0),
      delta: 'Total routes created',
      iconKey: 'routes',
      isLoading: isAdminStatsLoading,
    },
    {
      label: 'Records',
      value: String(adminStats?.recordCount ?? 0),
      delta: 'Across all collections',
      iconKey: 'records',
      isLoading: isAdminStatsLoading,
    },
    {
      label: 'Fields',
      value: String(totalFields),
      delta: 'Across all collections',
      iconKey: 'fields',
      isLoading,
    },
    {
      label: 'Views',
      value: String(totalViews),
      delta: 'Across all collections',
      iconKey: 'views',
      isLoading,
    },
    {
      label: 'Forms',
      value: String(totalForms),
      delta: 'Across all collections',
      iconKey: 'forms',
      isLoading,
    },
  ]

  const recentCollections = [...collections]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)

  const syncedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-gray-700 shadow-md rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-600">
                {iconMap[stat.iconKey]}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-100">{stat.isLoading ? '...' : stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 border border-gray-700 shadow-md rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Collections</h2>
          <div className="space-y-3">
            {recentCollections.length === 0 && (
              <p className="text-sm text-gray-500">No collections available yet.</p>
            )}
            {recentCollections.map((collection) => (
              <div key={collection.collection_key} className="flex gap-3 items-start">
                <div className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-snug">{collection.title || collection.collection_key}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {collection.field_list?.fields.length ?? 0} fields · {collection.view_list?.views.length ?? 0} views · {collection.form_list?.forms.length ?? 0} forms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="border border-gray-700 shadow-md rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:border-gray-600 border border-transparent transition-colors group"
              >
                <span className="text-gray-500 group-hover:text-blue-400 transition-colors text-base">
                  {action.icon}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-300 group-hover:text-gray-100">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border border-gray-700 shadow-md rounded-xl p-4 flex items-center justify-between text-xs text-gray-500">
        <span>{`Gateway v${appConfig.version || '...'}`}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {syncedAt ? `No errors logged as of ${syncedAt}` : 'No errors logged as of --'}
        </span>
      </div>
    </div>
  )
}
