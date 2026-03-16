import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, ArrowLeftRight, Database, Layers, Eye, FileText } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'
import { COLLECTIONS_NESTED_KEY, fetchCollectionsWithNested } from '../lib/queries'
import type { Collection } from '../lib/object_types'

type WeeklyTotal = { week: string; total: number }

type AdminDataResponse = {
  collections?: Array<{ key?: string; routes?: unknown[] }>
  record_count?: number
  weekly_request_totals?: WeeklyTotal[]
}

type AdminStats = {
  totalCollections: number
  totalRoutes: number
  recordCount: number
  weeklyRequestTotals: WeeklyTotal[]
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

function ApiRequestsChart({ data }: { data: WeeklyTotal[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm text-zinc-600">
        No request data available
      </div>
    )
  }

  const values = data.map((d) => d.total)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const midVal = Math.round((minVal + maxVal) / 2)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 24, left: 8, bottom: 30 }}>
        <XAxis
          dataKey="week"
          tickFormatter={(w: string) => w.slice(5).replace('-', '/')}
          tick={{ fontSize: 11, fill: '#71717a', angle: -35, textAnchor: 'end', dy: 16 } as React.SVGProps<SVGTextElement>}
          axisLine={false}
          tickLine={false}
          interval={0}
          height={40}
        />
        <YAxis
          tick={(props: { x: number; y: number; payload: { value: number } }) => {
            const { x, y, payload } = props
            if (payload.value === minVal || payload.value === maxVal || payload.value === midVal) {
              return (
                <text x={x - 4} y={y} dy={4} textAnchor="end" fontSize={11} fill="#71717a">
                  {payload.value}
                </text>
              )
            }
            return <g />
          }}
          axisLine={false}
          tickLine={false}
          width={36}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip
          formatter={(v: number) => [v.toLocaleString(), 'Requests']}
          labelFormatter={(l: string) => `Week of ${l}`}
          contentStyle={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            fontSize: 12,
            color: '#e4e4e7',
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#71717a"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#71717a' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function Dashboard() {
  const { data: adminStats, isLoading: isAdminStatsLoading } = useQuery<AdminStats>({
    queryKey: ['raptor-admin-stats'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) {
        return { totalCollections: 0, totalRoutes: 0, recordCount: 0, weeklyRequestTotals: [] }
      }

      const data = await res.json() as AdminDataResponse

      const totalRoutes = (data.collections ?? []).reduce((sum, collection) => {
        return sum + (collection.routes ? collection.routes.length : 0)
      }, 0)

      return {
        totalCollections: data.collections?.length ?? 0,
        totalRoutes,
        recordCount: data.record_count ?? 0,
        weeklyRequestTotals: data.weekly_request_totals ?? [],
      }
    },
  })

  const { data: collections = [], isLoading, dataUpdatedAt } = useQuery<Collection[]>({
    queryKey: COLLECTIONS_NESTED_KEY,
    queryFn: fetchCollectionsWithNested,
    staleTime: 30_000,
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

  const recentCollections = [...collections].sort((a, b) => b.id - a.id).slice(0, 5)

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
            className="border border-zinc-700 shadow-md rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-700 text-zinc-600">
                {iconMap[stat.iconKey]}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-100">{stat.isLoading ? '...' : stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-zinc-700 shadow-md rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">API Requests</h2>
          <p className="text-xs text-zinc-600 mb-4">Last 8 weeks</p>
          {isAdminStatsLoading ? (
            <div className="h-[260px] rounded-lg bg-zinc-800/40 animate-pulse" />
          ) : (
            <ApiRequestsChart data={adminStats?.weeklyRequestTotals ?? []} />
          )}
        </div>

        <div className="border border-zinc-700 shadow-md rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:border-zinc-600 border border-transparent transition-colors group"
              >
                <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors text-base">
                  {action.icon}
                </span>
                <div>
                  <div className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">
                    {action.label}
                  </div>
                  <div className="text-xs text-zinc-600">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Collections */}
      <div className="border border-zinc-700 shadow-md rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recent Collections</h2>
        <div className="space-y-3">
          {recentCollections.length === 0 && (
            <p className="text-sm text-zinc-500">No collections available yet.</p>
          )}
          {recentCollections.map((collection) => (
            <div key={collection.collection_key} className="flex gap-3 items-start">
              <div className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-zinc-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300 leading-snug">{collection.title || collection.collection_key}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {collection.field_list?.fields.length ?? 0} fields · {collection.view_list?.views.length ?? 0} views · {collection.form_list?.forms.length ?? 0} forms
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="border border-zinc-700 shadow-md rounded-xl p-4 flex items-center justify-between text-xs text-zinc-500">
        <span>{`Gateway v${appConfig.version || '...'}`}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          {syncedAt ? `No errors logged as of ${syncedAt}` : 'No errors logged as of --'}
        </span>
      </div>
    </div>
  )
}
