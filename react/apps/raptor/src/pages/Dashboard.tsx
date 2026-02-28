const stats = [
  {
    label: 'Total Nodes',
    value: '142',
    delta: '+12 this week',
    icon: '⬡',
    color: 'blue',
  },
  {
    label: 'Active Workflows',
    value: '8',
    delta: '2 currently running',
    icon: '⚡',
    color: 'green',
  },
  {
    label: 'Connections',
    value: '389',
    delta: '+45 today',
    icon: '⇌',
    color: 'purple',
  },
  {
    label: 'Data Points',
    value: '12.4K',
    delta: 'Last sync 2 min ago',
    icon: '◈',
    color: 'orange',
  },
]

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const recentActivity = [
  { time: '2m ago', action: 'Node "HTTP Request" updated', user: 'admin' },
  { time: '14m ago', action: 'Workflow "ETL Pipeline" ran successfully', user: 'system' },
  { time: '1h ago', action: 'Graph "Analytics" exported', user: 'editor' },
  { time: '3h ago', action: 'New connection added between Transform → Aggregate', user: 'admin' },
  { time: '5h ago', action: 'Workflow "Daily Sync" scheduled', user: 'admin' },
]

const quickActions = [
  { label: 'New Graph', description: 'Start a new node graph from scratch', icon: '⬡' },
  { label: 'Import', description: 'Import graph from JSON or YAML', icon: '⬆' },
  { label: 'Templates', description: 'Browse workflow templates', icon: '◧' },
  { label: 'Docs', description: 'Read the documentation', icon: '◑' },
]

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your Raptor node graph environment</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg border ${colorMap[stat.color]}`}>
                {stat.icon}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-100">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-snug">{item.action}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {item.time} · {item.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors group"
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between text-xs text-gray-500">
        <span>Raptor Graph Editor · Node graph powered by React Flow + Dagre</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System operational
        </span>
      </div>
    </div>
  )
}
