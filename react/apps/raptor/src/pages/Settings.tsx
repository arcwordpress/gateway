import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'
import DatabaseSettings from './Settings/DatabaseSettings'
import AISettings from './Settings/AISettings'
import CollectionSettings from './Settings/CollectionSettings'

interface SettingsData {
  id: number
  db_driver: string
  connection_port: string
  sqlite_path: string
  is_sqlite_environment: boolean
  anthropic_api_key: string
  has_anthropic_key: boolean
}

type TabKey = 'database' | 'ai' | 'collections'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'database', label: 'Database' },
  { key: 'ai', label: 'AI' },
  { key: 'collections', label: 'Collections' },
]

export default function Settings() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('database')
  const [pendingChanges, setPendingChanges] = useState<Partial<SettingsData>>({})
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Fetch settings
  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(apiUrl('gateway/v1/settings/1'), {
        headers: authHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch settings')
      return response.json()
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SettingsData>) => {
      const response = await fetch(apiUrl('gateway/v1/settings/1'), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update settings')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setPendingChanges({})
    },
  })

  // Auto-save with 1 second debounce
  useEffect(() => {
    if (Object.keys(pendingChanges).length === 0) {
      return
    }

    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    // Set new timer for 1 second
    const timer = setTimeout(() => {
      updateMutation.mutate(pendingChanges)
    }, 1000)

    setSaveTimer(timer)

    // Cleanup on unmount
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [pendingChanges])

  const handleFieldChange = (field: keyof SettingsData, value: string | boolean) => {
    setPendingChanges((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Failed to load settings</div>
      </div>
    )
  }

  // Merge settings with pending changes for display
  const currentSettings = { ...settings, ...pendingChanges }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
        <div className="flex items-center gap-3">
          {updateMutation.isPending && (
            <span className="text-sm text-zinc-400">Saving...</span>
          )}
          {updateMutation.isSuccess && Object.keys(pendingChanges).length === 0 && (
            <span className="text-sm text-zinc-300">Saved</span>
          )}
          {updateMutation.isError && (
            <span className="text-sm text-red-400">Save failed</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
              activeTab === tab.key
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'database' && (
          <DatabaseSettings
            settings={currentSettings}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === 'ai' && (
          <AISettings
            settings={currentSettings}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === 'collections' && <CollectionSettings />}
      </div>
    </div>
  )
}
