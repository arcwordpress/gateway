import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl, authHeaders } from '../lib/api';
import type { RouteInfo } from '../types/RouteInfo';
import type { GatewayCollection } from '../types/GatewayCollection';
import type { MigrationExtension } from '../types/MigrationExtension';
import type { MigrationPanelState } from '../types/MigrationPanelState';
import type { RunMigrationPanelState } from '../types/RunMigrationPanelState';
import type { PanelState } from '../types/PanelState';
import PanelShell from '../components/ui/PanelShell';
import MigrationPanel from '../components/collections/migrations/MigrationPanel';
import CollectionCard from '../components/collections/CollectionCard';

function RunMigrationPanel({
  state,
  onClose,
  onStateChange,
  onRefetch,
}: {
  state: RunMigrationPanelState
  onClose: () => void
  onStateChange: (s: RunMigrationPanelState) => void
  onRefetch: () => void
}) {
  const runMigration = async () => {
    onStateChange({ ...state, running: true, result: null })
    try {
      const res = await fetch(
        apiUrl(`gateway/v1/migrations/${state.collectionKey}/run`),
        { method: 'POST', headers: authHeaders() }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to run migration')
      onRefetch()
      onStateChange({
        ...state,
        running: false,
        result: { success: true, message: data.message ?? 'Migration executed successfully!' },
        afterRecordCount: null,
      })
    } catch (err) {
      onStateChange({
        ...state,
        running: false,
        result: { success: false, message: (err as Error).message },
      })
    }
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 6,
    background: '#18181b',
    border: '1px solid #3f3f46',
    marginBottom: 6,
  }

  return (
    <PanelShell title="Run Migration" sub={state.collectionKey} onClose={onClose} width={400}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>
            {typeof state.afterRecordCount === 'number' ? 'Before / After' : 'Before'}
          </div>
          <div style={rowStyle}>
            <span style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace' }}>{state.table}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>
                {typeof state.beforeRecordCount === 'number' ? state.beforeRecordCount.toLocaleString() : '—'} rows
              </span>
              {typeof state.afterRecordCount === 'number' && (
                <>
                  <span style={{ fontSize: 11, color: '#52525b' }}>→</span>
                  <span style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 600 }}>{typeof state.afterRecordCount === 'number' ? state.afterRecordCount.toLocaleString() : '-'} rows</span>
                </>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>
          This will create or alter the <code style={{ fontFamily: 'monospace', color: '#a1a1aa' }}>{state.table}</code> database table to match the current collection schema.
        </p>

        {state.result && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: '#18181b',
              border: `1px solid ${state.result.success ? '#3f3f46' : '#52525b'}`,
              fontSize: 12,
              color: state.result.success ? '#a1a1aa' : '#e4e4e7',
            }}
          >
            {state.result.message}
          </div>
        )}

        <button
          onClick={() => void runMigration()}
          disabled={state.running}
          className="w-full px-4 py-2 rounded-md bg-zinc-600 disabled:bg-zinc-700 border-none text-zinc-200 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
        >
          {state.running ? 'Running…' : state.result?.success ? 'Run Again' : 'Confirm & Run Migration'}
        </button>
      </div>
    </PanelShell>
  )
}

type AuthType = 'cookie' | 'basic' | 'public'
type RequestTab = 'request' | 'response' | 'code'
type CodeTab = 'curl' | 'fetch' | 'axios' | 'php_curl' | 'php_guzzle'

function RouteTestPanel({
  route,
  onClose,
}: {
  route: RouteInfo
  onClose: () => void
}) {
  const [authType, setAuthType] = useState<AuthType>('cookie')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [params, setParams] = useState<Record<string, string>>(
    ['get_one', 'update', 'delete'].includes(route.type) ? { id: '1' } : {}
  )
  const [body, setBody] = useState<Record<string, string>>(
    ['create', 'update'].includes(route.type) ? { title: 'Test Item', status: 'active' } : {}
  )
  const [response, setResponse] = useState<{
    success: boolean
    status?: number
    statusText?: string
    body?: unknown
    duration?: number
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<RequestTab>('request')
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('curl')
  const [codeExamples, setCodeExamples] = useState<Record<CodeTab, string> | null>(null)
  const [copied, setCopied] = useState(false)

  const buildUrl = useCallback(() => {
    let url = apiUrl(`${route.namespace}/${route.path}`)
    if (['get_one', 'update', 'delete'].includes(route.type)) {
      url = url.replace(/\/\(\?P<id>[^)]+\)/, '/' + (params.id ?? '1'))
    }
    return url
  }, [route, params])

  const buildHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authType === 'cookie') {
      const nonce = (window as Window & { raptorConfig?: { nonce: string } }).raptorConfig?.nonce ?? ''
      h['X-WP-Nonce'] = nonce
    } else if (authType === 'basic' && username && password) {
      h['Authorization'] = 'Basic ' + btoa(`${username}:${password}`)
    }
    return h
  }, [authType, username, password])

  const testRoute = async () => {
    setLoading(true)
    setResponse(null)
    try {
      const url = buildUrl()
      const headers = buildHeaders()
      const opts: RequestInit = {
        method: route.method,
        headers,
        ...(authType === 'cookie' ? { credentials: 'include' as const } : {}),
      }
      if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
        opts.body = JSON.stringify(body)
      }
      const start = performance.now()
      const res = await fetch(url, opts)
      const duration = Math.round(performance.now() - start)
      const ct = res.headers.get('content-type') ?? ''
      const bodyData = ct.includes('application/json') ? await res.json() : await res.text()
      setResponse({ success: true, status: res.status, statusText: res.statusText, body: bodyData, duration })
      generateCodeExamples()
      setActiveTab('response')
    } catch (err) {
      setResponse({ success: false, error: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const generateCodeExamples = useCallback(() => {
    const url = buildUrl()
    const nonce = (window as Window & { raptorConfig?: { nonce: string } }).raptorConfig?.nonce ?? '<nonce>'
    const curl = buildCurl(url, nonce)
    const fetchCode = buildFetch(url, nonce)
    const axiosCode = buildAxios(url, nonce)
    const phpCurl = buildPhpCurl(url, nonce)
    const phpGuzzle = buildPhpGuzzle(url, nonce)
    setCodeExamples({ curl, fetch: fetchCode, axios: axiosCode, php_curl: phpCurl, php_guzzle: phpGuzzle })
  }, [buildUrl, authType, username, password, body, route.method]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildCurl = (url: string, nonce: string) => {
    let cmd = `curl -X ${route.method} \\\n  '${url}'`
    if (authType === 'basic') cmd += ` \\\n  -u '${username || 'your_username'}:${password || 'your_app_password'}'`
    else if (authType === 'cookie') cmd += ` \\\n  -H 'X-WP-Nonce: ${nonce}' \\\n  --cookie 'wordpress_logged_in_xxx=your_cookie_value'`
    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      const jsonBody = JSON.stringify(body, null, 2).replace(/'/g, "\\'")
      cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${jsonBody}'`
    }
    return cmd
  }

  const buildFetch = (url: string, nonce: string) => {
    let code = `fetch('${url}', {\n  method: '${route.method}',\n  headers: {\n    'Content-Type': 'application/json'`
    if (authType === 'basic') code += `,\n    'Authorization': 'Basic ${btoa(`${username || 'your_username'}:${password || 'your_app_password'}`)}'`
    else if (authType === 'cookie') code += `,\n    'X-WP-Nonce': '${nonce}'`
    code += '\n  }'
    if (authType === 'cookie') code += ",\n  credentials: 'include'"
    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      code += ',\n  body: JSON.stringify(' + JSON.stringify(body, null, 2).replace(/\n/g, '\n  ') + ')'
    }
    code += "\n})\n  .then(r => r.json())\n  .then(d => console.log(d))"
    return code
  }

  const buildAxios = (url: string, nonce: string) => {
    const m = route.method.toLowerCase()
    let code = `axios.${m}('${url}'`
    if (['post', 'put', 'patch'].includes(m) && Object.keys(body).length > 0) {
      code = `axios.${m}('${url}', ${JSON.stringify(body, null, 2)},`
    } else {
      code += ','
    }
    code += ` {\n  headers: { 'Content-Type': 'application/json'`
    if (authType === 'basic') code += `, 'Authorization': 'Basic ${btoa(`${username || 'your_username'}:${password || 'your_app_password'}`)}'`
    else if (authType === 'cookie') code += `, 'X-WP-Nonce': '${nonce}'`
    code += ' }'
    if (authType === 'cookie') code += ',\n  withCredentials: true'
    code += "\n})\n  .then(r => console.log(r.data))"
    return code
  }

  const buildPhpCurl = (url: string, nonce: string) => {
    let code = `<?php\n$ch = curl_init();\ncurl_setopt_array($ch, [\n  CURLOPT_URL => '${url}',\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_CUSTOMREQUEST => '${route.method}',\n  CURLOPT_HTTPHEADER => [\n    'Content-Type: application/json'`
    if (authType === 'cookie') code += `,\n    'X-WP-Nonce: ${nonce}'\n  ],\n  CURLOPT_COOKIE => 'wordpress_logged_in_xxx=your_cookie_value'`
    else if (authType === 'basic') code += `\n  ],\n  CURLOPT_USERPWD => '${username || 'your_username'}:${password || 'your_app_password'}'`
    else code += '\n  ]'
    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      code += `,\n  CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')})`
    }
    code += "\n]);\n$response = curl_exec($ch);\ncurl_close($ch);\n$data = json_decode($response, true);"
    return code
  }

  const buildPhpGuzzle = (url: string, nonce: string) => {
    const m = route.method.toLowerCase()
    let code = `<?php\nuse GuzzleHttp\\Client;\n$client = new Client();\n$response = $client->${m}('${url}', [\n  'headers' => ['Content-Type' => 'application/json'`
    if (authType === 'cookie') code += `, 'X-WP-Nonce' => '${nonce}'`
    if (authType === 'basic') code += `],\n  'auth' => ['${username || 'your_username'}', '${password || 'your_app_password'}']`
    else code += ']'
    if (['post', 'put', 'patch'].includes(m) && Object.keys(body).length > 0) {
      code += `,\n  'json' => ${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')}`
    }
    code += "\n]);\n$data = json_decode($response->getBody(), true);"
    return code
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Failed to copy')
    }
  }

  const inputCls = 'w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
  const tabCls = (active: boolean) =>
    active
      ? 'px-3 py-1.5 text-xs font-medium border-b-2 border-zinc-400 text-zinc-200'
      : 'px-3 py-1.5 text-xs font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-300'

  return (
    <PanelShell title="Test Route" sub={`${route.method} ${route.displayRoute}`} onClose={onClose} width={480}>
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-4 -mx-5 px-5">
        {(['request', 'response', 'code'] as RequestTab[]).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'code' && !codeExamples) generateCodeExamples() }} className={tabCls(activeTab === tab)}>
            {tab === 'request' ? 'Request' : tab === 'response' ? 'Response' : 'Code Examples'}
          </button>
        ))}
      </div>

      {activeTab === 'request' && (
        <div className="space-y-4">
          {/* Auth */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Authentication</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value as AuthType)} className={inputCls}>
              <option value="cookie">Cookie (logged-in user)</option>
              <option value="basic">Basic Auth (username + app password)</option>
              <option value="public">Public (no auth)</option>
            </select>
          </div>

          {authType === 'basic' && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">App Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="xxxx xxxx" className={inputCls} />
              </div>
            </div>
          )}

          {/* URL params */}
          {(['get_one', 'update', 'delete'].includes(route.type)) && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">URL Parameters</label>
              <div className="space-y-1.5">
                {Object.keys(params).map((k) => (
                  <div key={k} className="flex gap-2">
                    <input type="text" value={k} disabled className={`${inputCls} flex-1 opacity-60`} />
                    <input type="text" value={params[k]} onChange={(e) => setParams({ ...params, [k]: e.target.value })} className={`${inputCls} flex-1`} placeholder="Value" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query params for get_many */}
          {route.type === 'get_many' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Query Parameters</label>
                <button onClick={() => { const k = prompt('Parameter name:'); if (k) setParams({ ...params, [k]: '' }) }} className="text-[10px] text-zinc-300 hover:text-zinc-100">+ Add</button>
              </div>
              <div className="space-y-1.5">
                {Object.keys(params).map((k) => (
                  <div key={k} className="flex gap-2">
                    <input type="text" value={k} disabled className={`${inputCls} flex-1 opacity-60`} />
                    <input type="text" value={params[k]} onChange={(e) => setParams({ ...params, [k]: e.target.value })} className={`${inputCls} flex-1`} placeholder="Value" />
                    <button onClick={() => { const n = { ...params }; delete n[k]; setParams(n) }} className="px-2 py-1 text-xs bg-zinc-900/60 text-zinc-400 rounded hover:bg-zinc-800">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(route.method) && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Request Body</label>
                <button onClick={() => { const k = prompt('Field name:'); if (k) setBody({ ...body, [k]: '' }) }} className="text-[10px] text-zinc-300 hover:text-zinc-100">+ Add Field</button>
              </div>
              <div className="space-y-1.5">
                {Object.keys(body).map((k) => (
                  <div key={k} className="flex gap-2">
                    <input type="text" value={k} disabled className={`${inputCls} flex-1 opacity-60`} />
                    <input type="text" value={body[k]} onChange={(e) => setBody({ ...body, [k]: e.target.value })} className={`${inputCls} flex-1`} placeholder="Value" />
                    <button onClick={() => { const n = { ...body }; delete n[k]; setBody(n) }} className="px-2 py-1 text-xs bg-zinc-900/60 text-zinc-400 rounded hover:bg-zinc-800">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => void testRoute()}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      )}

      {activeTab === 'response' && (
        <div>
          {!response ? (
            <div className="text-center py-12 text-zinc-600 text-sm">Send a request to see the response</div>
          ) : response.success ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded bg-zinc-800/30 border border-zinc-700/30">
                <span className="text-zinc-200 text-xs font-medium">
                  {response.status} {response.statusText}
                </span>
                {response.duration && (
                  <span className="text-zinc-500 text-[10px]">{response.duration}ms</span>
                )}
              </div>
              <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-80 overflow-y-auto">
                <code>{JSON.stringify(response.body, null, 2)}</code>
              </pre>
            </div>
          ) : (
            <div className="p-3 rounded bg-red-900/20 border border-red-700/30">
              <p className="text-red-300 text-xs font-medium">Error</p>
              <p className="text-red-400 text-xs mt-1">{response.error}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'code' && (
        <div>
          {!codeExamples ? (
            <div className="text-center py-12 text-zinc-600 text-sm">Configure your request first</div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1 border-b border-zinc-800 pb-2">
                {(['curl', 'fetch', 'axios', 'php_curl', 'php_guzzle'] as CodeTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveCodeTab(t)}
                    className={`px-2 py-1 text-[10px] rounded ${activeCodeTab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t === 'php_curl' ? 'PHP cURL' : t === 'php_guzzle' ? 'PHP Guzzle' : t === 'curl' ? 'cURL' : t === 'fetch' ? 'Fetch' : 'Axios'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => void copyText(codeExamples[activeCodeTab])}
                  className="absolute top-2 right-2 px-2 py-0.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  <code>{codeExamples[activeCodeTab]}</code>
                </pre>
              </div>
              {authType === 'cookie' && (
                <p className="text-[10px] text-zinc-500 p-2 bg-zinc-900/10 border border-zinc-800/30 rounded">
                  Cookie auth requires the request to be from the same domain with a valid WordPress session. The nonce is temporary and will expire.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </PanelShell>
  )
}

export default function GatewayCollections() {

  const [panel, setPanel] = useState<PanelState>(null)

  const { data: registeredCollections = [], isLoading: isRegisteredLoading, isError: isRegisteredError } = useQuery({
    queryKey: ['registered-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/collections'), { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log('reg/res', res)
      const items = await res.json();
      return items ?? [];
    },
  });

  const { data, isLoading, isError, refetch } = useQuery<{ collections: GatewayCollection[] }>({
    queryKey: ['gateway-admin-data'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

  console.log('Gateway admin-data query result:', data);

  const collections = data?.collections ?? []

  const fetchExtensions = async (): Promise<MigrationExtension[]> => {
    try {
      const res = await fetch(apiUrl('gateway/v1/migrations/extensions/list'), { headers: authHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.extensions ?? []
    } catch {
      return []
    }
  }

  const handleGenerateMigration = async (collection: GatewayCollection) => {
    const initialState: MigrationPanelState = {
      collectionKey: collection.key,
      title: collection.title,
      migration: null,
      loading: true,
      extensions: [],
      extensionsLoading: true,
      installing: false,
      installSuccess: null,
      runningMigration: false,
    }
    setPanel({ mode: 'migration', data: initialState })

    const [migRes, extensions] = await Promise.all([
      fetch(apiUrl(`gateway/v1/migrations/${collection.key}`), { headers: authHeaders() }),
      fetchExtensions(),
    ])

    if (!migRes.ok) {
      alert('Failed to generate migration')
      setPanel(null)
      return
    }

    const migJson = await migRes.json()
    setPanel({
      mode: 'migration',
      data: {
        ...initialState,
        migration: migJson.migration,
        loading: false,
        extensions,
        extensionsLoading: false,
      },
    })
  }

  const handleRunMigration = (collection: GatewayCollection) => {
    setPanel({
      mode: 'runMigration',
      data: {
        collectionKey: collection.key,
        title: collection.title,
        table: collection.table,
        beforeRecordCount: collection.record_count,
        running: false,
        result: null,
        afterRecordCount: null,
      },
    })
  }

  const handleTestRoute = (route: RouteInfo, collectionKey: string) => {
    setPanel({ mode: 'routeTest', data: { route, collectionKey } })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 font-semibold text-base">Registered Collections</h2>
        </div>
        {!isLoading && !isError && (
          <span className="text-[11px] text-zinc-600 bg-zinc-800/60 px-2.5 py-1 rounded-full">
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-zinc-600 text-sm">Loading collections…</p>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-700/30">
            <p className="text-red-400 text-sm">Failed to load collections. Make sure you are logged in as an admin.</p>
          </div>
        )}

        {!isLoading && !isError && registeredCollections.length === 0 && (
          <div className="flex items-center justify-center py-16 border-2 border-dashed border-zinc-800 rounded-lg">
            <div className="text-center">
              <p className="text-zinc-600 text-sm">No registered collections found</p>
              <p className="text-zinc-700 text-xs mt-1">Register collections using <code className="text-zinc-500">YourCollection::register()</code></p>
            </div>
          </div>
        )}

        {!isLoading && !isError && collections.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {registeredCollections.map((col) => (
              <CollectionCard
                key={col.key}
                collection={col}
                onGenerateMigration={() => void handleGenerateMigration(col)}
                onRunMigration={() => handleRunMigration(col)}
                onTestRoute={(route) => handleTestRoute(route, col.key)}
              />
            ))}
          </div>
        )}
      </div>

      {panel?.mode === 'migration' && (
        <MigrationPanel
          state={panel.data}
          onClose={() => setPanel(null)}
          onStateChange={(s) => setPanel({ mode: 'migration', data: s })}
        />
      )}
      {panel?.mode === 'runMigration' && (
        <RunMigrationPanel
          state={panel.data}
          onClose={() => setPanel(null)}
          onStateChange={(s) => setPanel({ mode: 'runMigration', data: s })}
          onRefetch={() => {
            void refetch().then((result) => {
              const updated = result.data?.collections?.find((c) => c.key === (panel as { mode: 'runMigration'; data: RunMigrationPanelState }).data.collectionKey)
              if (updated) {
                setPanel((prev) => prev?.mode === 'runMigration'
                  ? { ...prev, data: { ...prev.data, afterRecordCount: updated.record_count } }
                  : prev
                )
              }
            })
          }}
        />
      )}
      {panel?.mode === 'routeTest' && (
        <RouteTestPanel
          route={panel.data.route}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}
