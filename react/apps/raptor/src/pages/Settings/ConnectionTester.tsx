import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

export default function ConnectionTester() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string>('')

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const url = apiUrl('gateway/v1/settings/connection');
      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('Connection test failed');
      return response.json();
    },
    onMutate: () => {
      setTestStatus('testing');
      setTestMessage('');
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      setTestStatus(data.success ? 'success' : 'error');
      setTestMessage(data.message || (data.success ? 'Connection successful' : 'Connection failed'));
    },
    onError: (error: Error) => {
      setTestStatus('error');
      setTestMessage(error.message || 'Connection test failed');
    },
  });

  return (
    <div className="space-y-2 mb-6">
      <button
        onClick={() => testConnectionMutation.mutate()}
        disabled={testStatus === 'testing'}
        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
      >
        {testStatus === 'testing' ? 'Testing...' : 'Test Connection (GET /settings/connection)'}
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
  )
}
