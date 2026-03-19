import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

interface SettingsData {
  anthropic_api_key: string
  has_anthropic_key: boolean
}

interface AISettingsProps {
  settings: SettingsData
  onChange: (field: keyof SettingsData, value: string | boolean) => void
}

export default function AISettings({ settings, onChange }: AISettingsProps) {
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string>('')
  const [localKey, setLocalKey] = useState('')

  const testApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(apiUrl('gateway/v1/test-anthropic'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          api_key: localKey || settings.anthropic_api_key,
        }),
      })
      if (!response.ok) throw new Error('API key test failed')
      return response.json()
    },
    onMutate: () => {
      setTestStatus('testing')
      setTestMessage('')
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      setTestStatus(data.success ? 'success' : 'error')
      setTestMessage(data.message || (data.success ? 'API key is valid' : 'API key test failed'))
    },
    onError: (error: Error) => {
      setTestStatus('error')
      setTestMessage(error.message || 'API key test failed')
    },
  })

  const handleKeyChange = (value: string) => {
    setLocalKey(value)
    onChange('anthropic_api_key', value)
    
    // Update has_anthropic_key flag
    if (value.trim()) {
      onChange('has_anthropic_key', true)
    } else {
      onChange('has_anthropic_key', false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* API Key Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={localKey || ''}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder={settings.has_anthropic_key ? '••••••••••••••••' : 'sk-ant-...'}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-md px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent placeholder-zinc-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-300"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="flex items-start gap-2 text-sm">
          {settings.has_anthropic_key && !localKey && (
            <p className="text-zinc-300">✓ API key configured</p>
          )}
          <p className="text-zinc-400">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-300 underline"
            >
              Anthropic Console
            </a>
          </p>
        </div>
      </div>

      {/* Test API Key Button */}
      <div className="space-y-2">
        <button
          onClick={() => testApiKeyMutation.mutate()}
          disabled={testStatus === 'testing' || (!localKey && !settings.has_anthropic_key)}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test API Key'}
        </button>

        {testMessage && (
          <div
            className={`p-3 rounded-md ${
              testStatus === 'success'
                ? 'bg-zinc-800/50 text-zinc-300 border border-zinc-700'
                : testStatus === 'error'
                ? 'bg-red-900/30 text-red-400 border border-red-700'
                : ''
            }`}
          >
            {testMessage}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-md space-y-2">
        <h3 className="text-sm font-medium text-zinc-200">About Maze AI</h3>
        <p className="text-sm text-zinc-400">
          Gateway integrates with Anthropic's Claude AI models through the Maze AI feature.
          This enables intelligent code generation, analysis, and assistance capabilities.
        </p>
        <p className="text-sm text-zinc-400">
          Your API key is encrypted before being stored and never exposed in API responses.
        </p>
      </div>
    </div>
  )
}
