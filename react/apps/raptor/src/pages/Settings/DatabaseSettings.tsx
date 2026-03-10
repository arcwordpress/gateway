import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

interface SettingsData {
  db_driver: string
  connection_port: string
  sqlite_path: string
  is_sqlite_environment: boolean
}

interface DatabaseSettingsProps {
  settings: SettingsData
  onChange: (field: keyof SettingsData, value: string | boolean) => void
}

export default function DatabaseSettings({ settings, onChange }: DatabaseSettingsProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string>('')

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(apiUrl('gateway/v1/test-connection'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          port: settings.connection_port,
          driver: settings.db_driver,
          sqlite_path: settings.sqlite_path,
        }),
      })
      if (!response.ok) throw new Error('Connection test failed')
      return response.json()
    },
    onMutate: () => {
      setTestStatus('testing')
      setTestMessage('')
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      setTestStatus(data.success ? 'success' : 'error')
      setTestMessage(data.message || (data.success ? 'Connection successful' : 'Connection failed'))
    },
    onError: (error: Error) => {
      setTestStatus('error')
      setTestMessage(error.message || 'Connection test failed')
    },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Database Driver */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Database Driver
        </label>
        <select
          value={settings.db_driver}
          onChange={(e) => onChange('db_driver', e.target.value)}
          className="w-full bg-dark text-gray-100 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="mysql">MySQL</option>
          <option value="sqlite">SQLite</option>
        </select>
        {settings.is_sqlite_environment && (
          <p className="text-sm text-amber-400">
            ⚠ SQLite environment detected
          </p>
        )}
      </div>

      {/* Connection Port */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Connection Port
        </label>
        <input
          type="text"
          value={settings.connection_port}
          onChange={(e) => onChange('connection_port', e.target.value)}
          placeholder="Leave empty for default"
          className="w-full bg-dark text-gray-100 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
        />
        <p className="text-sm text-gray-400">
          Leave empty to use system default port (MySQL: 3306, SQLite: N/A)
        </p>
      </div>

      {/* SQLite Path (only shown when driver is sqlite) */}
      {settings.db_driver === 'sqlite' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            SQLite Database Path
          </label>
          <input
            type="text"
            value={settings.sqlite_path}
            onChange={(e) => onChange('sqlite_path', e.target.value)}
            placeholder="e.g., /path/to/database.sqlite"
            className="w-full bg-dark text-gray-100 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          />
          <p className="text-sm text-gray-400">
            Full path to your SQLite database file
          </p>
        </div>
      )}

      {/* Test Connection Button */}
      <div className="space-y-2">
        <button
          onClick={() => testConnectionMutation.mutate()}
          disabled={testStatus === 'testing'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </button>

        {testMessage && (
          <div
            className={`p-3 rounded-md ${
              testStatus === 'success'
                ? 'bg-green-900/30 text-green-400 border border-green-700'
                : testStatus === 'error'
                ? 'bg-red-900/30 text-red-400 border border-red-700'
                : ''
            }`}
          >
            {testMessage}
          </div>
        )}
      </div>
    </div>
  )
}
