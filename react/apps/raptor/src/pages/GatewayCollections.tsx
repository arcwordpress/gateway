import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'
import { useApp } from '../context/app'

// ─── Types ─────────────────────────────────────────────────────────────────

type RouteInfo = {
  type: string
  method: string
  route: string
  displayRoute: string
  namespace: string
  path: string
}

type GatewayCollection = {
  key: string
  title: string
  titlePlural: string
  className: string
  fqcn: string
  table: string
  record_count: number
  routes: RouteInfo[]
}

type MigrationData = {
  code: string
  className: string
  tableName: string
  notes: string[]
}

type MigrationExtension = {
  key: string
  slug: string
  databasePath: string
}

type MigrationPanelState = {
  collectionKey: string
  title: string
  migration: MigrationData | null
  loading: boolean
  extensions: MigrationExtension[]
  extensionsLoading: boolean
  installing: boolean
  installSuccess: { message: string; filePath: string } | null
  runningMigration: boolean
}

type RouteTestPanelState = {
  route: RouteInfo
  collectionKey: string
}

type PanelState =
  | { mode: 'migration'; data: MigrationPanelState }
  | { mode: 'routeTest'; data: RouteTestPanelState }
  | null

// ─── Panel geometry ──────────────────────────────────────────────────────────

function usePanelGeometry() {
  const { shellTopOffset, shellHeightCss } = useApp()
  return { top: shellTopOffset, height: shellHeightCss }
}

// ─── Panel shell ─────────────────────────────────────────────────────────────

function PanelShell({
  title,
  sub,
  onClose,
  children,
  width = 400,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}) {
  const { top, height } = usePanelGeometry()

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top,
        height,
        width,
        background: '#000',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{title}</div>
          {sub && (
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '2px 4px',
            marginTop: 2,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Method badge ─────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET:    'bg-blue-900/60 text-blue-300 border-blue-700/50',
    POST:   'bg-green-900/60 text-green-300 border-green-700/50',
    PUT:    'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
    PATCH:  'bg-orange-900/60 text-orange-300 border-orange-700/50',
    DELETE: 'bg-red-900/60 text-red-300 border-red-700/50',
  }
  const cls = colors[method] ?? 'bg-gray-900/60 text-gray-300 border-gray-700/50'
  return (
    <span className={`inline-flex items-center justify-center w-14 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      {method}
    </span>
  )
}

// ─── Route type label ─────────────────────────────────────────────────────────

function routeTypeLabel(type: string): string {
  const map: Record<string, string> = {
    get_many: 'Get Many',
    get_one:  'Get One',
    create:   'Create',
    update:   'Update',
    delete:   'Delete',
  }
  return map[type] ?? type
}

// ─── Migration Panel ──────────────────────────────────────────────────────────

function MigrationPanel({
  state,
  onClose,
  onStateChange,
}: {
  state: MigrationPanelState
  onClose: () => void
  onStateChange: (s: MigrationPanelState) => void
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.left = '-999999px'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      alert('Failed to copy to clipboard')
    }
  }

  const installMigration = async (extensionKey: string) => {
    onStateChange({ ...state, installing: true, installSuccess: null })
    try {
      const res = await fetch(
        apiUrl(`gateway/v1/migrations/${state.collectionKey}/install`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ extension: extensionKey }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to install migration')
      onStateChange({
        ...state,
        installing: false,
        installSuccess: { message: data.message, filePath: data.filePath },
      })
    } catch (err) {
      alert('Error installing migration: ' + (err as Error).message)
      onStateChange({ ...state, installing: false })
    }
  }

  const runMigration = async () => {
    if (!confirm('Run this migration? This will create or update the database table.')) return
    onStateChange({ ...state, runningMigration: true })
    try {
      const res = await fetch(
        apiUrl(`gateway/v1/migrations/${state.collectionKey}/run`),
        { method: 'POST', headers: authHeaders() }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to run migration')
      alert(data.message ?? 'Migration executed successfully!')
      onClose()
    } catch (err) {
      alert('Error running migration: ' + (err as Error).message)
      onStateChange({ ...state, runningMigration: false })
    }
  }

  return (
    <PanelShell title="Database Migration" sub={state.collectionKey} onClose={onClose} width={480}>
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">Generating migration code…</p>
        </div>
      ) : state.migration ? (
        <div className="space-y-4">
          {/* Install success */}
          {state.installSuccess && (
            <div className="p-3 rounded-lg bg-green-900/30 border border-green-700/40">
              <p className="text-green-300 text-xs font-semibold mb-1">Migration Installed Successfully!</p>
              <p className="text-green-400 text-xs">{state.installSuccess.message}</p>
              <code className="text-[10px] text-green-600 font-mono block mt-2 bg-green-900/20 px-2 py-1 rounded">
                {state.installSuccess.filePath}
              </code>
            </div>
          )}

          {/* Install to extension */}
          {state.extensions.length > 0 && !state.installSuccess && (
            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
              <p className="text-blue-300 text-xs font-semibold mb-2">Install to Extension</p>
              <div className="space-y-1.5">
                {state.extensions.map((ext) => (
                  <div
                    key={ext.key}
                    className="flex items-center justify-between p-2 rounded bg-gray-900/60 border border-gray-800/50"
                  >
                    <div>
                      <div className="text-gray-200 text-xs font-medium">{ext.slug}</div>
                      <code className="text-[10px] text-gray-500 font-mono">{ext.databasePath}</code>
                    </div>
                    <button
                      onClick={() => void installMigration(ext.key)}
                      disabled={state.installing}
                      className="px-2.5 py-1 text-xs rounded bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {state.installing ? 'Installing…' : 'Install'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual instructions */}
          {!state.installSuccess && (
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700/40">
              <p className="text-gray-300 text-xs font-semibold mb-1.5">Manual Installation</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400">
                <li>
                  Save to{' '}
                  <code className="text-gray-300 bg-gray-800/60 px-1 rounded">
                    /lib/Database/{state.migration.className}.php
                  </code>
                </li>
                <li>Require the file in your plugin</li>
                <li>
                  Call{' '}
                  <code className="text-gray-300 bg-gray-800/60 px-1 rounded">
                    {state.migration.className}::create()
                  </code>{' '}
                  from your activation hook
                </li>
              </ol>
            </div>
          )}

          {/* Notes */}
          {state.migration.notes.length > 0 && (
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
              <p className="text-yellow-300 text-xs font-semibold mb-1">Notes</p>
              <ul className="list-disc list-inside space-y-0.5">
                {state.migration.notes.map((note, i) => (
                  <li key={i} className="text-yellow-400 text-xs">{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Code */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-gray-300 text-xs font-semibold">Generated Code</span>
              <button
                onClick={() => void copyToClipboard(state.migration!.code)}
                className="px-2.5 py-0.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-950 text-gray-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-64 overflow-y-auto">
              <code>{state.migration.code}</code>
            </pre>
          </div>

          {/* Run button */}
          <button
            onClick={() => void runMigration()}
            disabled={state.runningMigration}
            className="w-full px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {state.runningMigration ? 'Running Migration…' : 'Run Migration Now'}
          </button>
        </div>
      ) : null}
    </PanelShell>
  )
}

// ─── Route Test Panel ─────────────────────────────────────────────────────────

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
  const [params, setParams] = useState<Record<string, string>>(() => {
    if (['get_one', 'update', 'delete'].includes(route.type)) return { id: '1' }
    return {}
  })
  const [body, setBody] = useState<Record<string, string>>(() => {
    if (['create', 'update'].includes(route.type)) return { title: 'Test Item', status: 'active' }
    return {}
  })
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

  const inputCls = 'w-full px-2.5 py-1.5 rounded bg-gray-900 border border-gray-700 text-gray-100 text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors'
  const tabCls = (active: boolean) =>
    active
      ? 'px-3 py-1.5 text-xs font-medium border-b-2 border-blue-500 text-blue-400'
      : 'px-3 py-1.5 text-xs font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-300'

  return (
    <PanelShell title="Test Route" sub={`${route.method} ${route.displayRoute}`} onClose={onClose} width={480}>
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-4 -mx-5 px-5">
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
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Authentication</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value as AuthType)} className={inputCls}>
              <option value="cookie">Cookie (logged-in user)</option>
              <option value="basic">Basic Auth (username + app password)</option>
              <option value="public">Public (no auth)</option>
            </select>
          </div>

          {authType === 'basic' && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">App Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="xxxx xxxx" className={inputCls} />
              </div>
            </div>
          )}

          {/* URL params */}
          {(['get_one', 'update', 'delete'].includes(route.type)) && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">URL Parameters</label>
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
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Query Parameters</label>
                <button onClick={() => { const k = prompt('Parameter name:'); if (k) setParams({ ...params, [k]: '' }) }} className="text-[10px] text-blue-400 hover:text-blue-300">+ Add</button>
              </div>
              <div className="space-y-1.5">
                {Object.keys(params).map((k) => (
                  <div key={k} className="flex gap-2">
                    <input type="text" value={k} disabled className={`${inputCls} flex-1 opacity-60`} />
                    <input type="text" value={params[k]} onChange={(e) => setParams({ ...params, [k]: e.target.value })} className={`${inputCls} flex-1`} placeholder="Value" />
                    <button onClick={() => { const n = { ...params }; delete n[k]; setParams(n) }} className="px-2 py-1 text-xs bg-red-900/40 text-red-400 rounded hover:bg-red-900/60">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(route.method) && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Request Body</label>
                <button onClick={() => { const k = prompt('Field name:'); if (k) setBody({ ...body, [k]: '' }) }} className="text-[10px] text-blue-400 hover:text-blue-300">+ Add Field</button>
              </div>
              <div className="space-y-1.5">
                {Object.keys(body).map((k) => (
                  <div key={k} className="flex gap-2">
                    <input type="text" value={k} disabled className={`${inputCls} flex-1 opacity-60`} />
                    <input type="text" value={body[k]} onChange={(e) => setBody({ ...body, [k]: e.target.value })} className={`${inputCls} flex-1`} placeholder="Value" />
                    <button onClick={() => { const n = { ...body }; delete n[k]; setBody(n) }} className="px-2 py-1 text-xs bg-red-900/40 text-red-400 rounded hover:bg-red-900/60">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => void testRoute()}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      )}

      {activeTab === 'response' && (
        <div>
          {!response ? (
            <div className="text-center py-12 text-gray-600 text-sm">Send a request to see the response</div>
          ) : response.success ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded bg-green-900/20 border border-green-700/30">
                <span className="text-green-300 text-xs font-medium">
                  {response.status} {response.statusText}
                </span>
                {response.duration && (
                  <span className="text-green-600 text-[10px]">{response.duration}ms</span>
                )}
              </div>
              <pre className="bg-gray-950 text-gray-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-80 overflow-y-auto">
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
            <div className="text-center py-12 text-gray-600 text-sm">Configure your request first</div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1 border-b border-gray-800 pb-2">
                {(['curl', 'fetch', 'axios', 'php_curl', 'php_guzzle'] as CodeTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveCodeTab(t)}
                    className={`px-2 py-1 text-[10px] rounded ${activeCodeTab === t ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {t === 'php_curl' ? 'PHP cURL' : t === 'php_guzzle' ? 'PHP Guzzle' : t === 'curl' ? 'cURL' : t === 'fetch' ? 'Fetch' : 'Axios'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => void copyText(codeExamples[activeCodeTab])}
                  className="absolute top-2 right-2 px-2 py-0.5 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="bg-gray-950 text-gray-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  <code>{codeExamples[activeCodeTab]}</code>
                </pre>
              </div>
              {authType === 'cookie' && (
                <p className="text-[10px] text-yellow-600 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
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

// ─── Collection card ──────────────────────────────────────────────────────────

function CollectionCard({
  collection,
  onGenerateMigration,
  onRunMigration,
  onTestRoute,
  isRunningMigration,
}: {
  collection: GatewayCollection
  onGenerateMigration: () => void
  onRunMigration: () => void
  onTestRoute: (route: RouteInfo) => void
  isRunningMigration: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gray-100 font-semibold text-sm">{collection.title}</h3>
            <code className="text-[11px] text-gray-500 font-mono">{collection.key}</code>
          </div>
          {collection.record_count !== undefined && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Records</div>
              <div className="text-sm font-semibold text-gray-200">{collection.record_count.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 mb-3">
          <div>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Class</span>
            <code className="block text-[11px] text-gray-400 font-mono truncate">{collection.fqcn}</code>
          </div>
          <div>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Table</span>
            <code className="block text-[11px] text-gray-400 font-mono">{collection.table}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onGenerateMigration}
            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            Generate Migration
          </button>
          <button
            onClick={onRunMigration}
            disabled={isRunningMigration}
            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isRunningMigration ? 'Running…' : 'Run Migration'}
          </button>
        </div>
      </div>

      {/* Routes toggle */}
      {collection.routes.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-4 py-2 flex justify-between items-center border-t border-gray-800 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-colors"
          >
            <span>{collection.routes.length} route{collection.routes.length !== 1 ? 's' : ''}</span>
            <span>{expanded ? '▲' : '▼'}</span>
          </button>

          {expanded && (
            <div className="border-t border-gray-800/60 divide-y divide-gray-800/60">
              {collection.routes.map((route, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MethodBadge method={route.method} />
                    <div className="min-w-0">
                      <code className="text-[11px] text-gray-300 block truncate">{route.displayRoute}</code>
                      <span className="text-[10px] text-gray-600">{routeTypeLabel(route.type)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onTestRoute(route)}
                    className="shrink-0 px-2.5 py-1 text-[10px] rounded bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 border border-blue-800/40 transition-colors"
                  >
                    Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GatewayCollections() {
  const [panel, setPanel] = useState<PanelState>(null)
  const [runningMigrations, setRunningMigrations] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, refetch } = useQuery<{ collections: GatewayCollection[] }>({
    queryKey: ['gateway-admin-data'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

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

  const handleRunMigration = async (collectionKey: string) => {
    if (!confirm('Run this migration? This will create or update the database table.')) return
    setRunningMigrations((prev) => new Set(prev).add(collectionKey))
    try {
      const res = await fetch(apiUrl(`gateway/v1/migrations/${collectionKey}/run`), {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to run migration')
      alert(data.message ?? 'Migration executed successfully!')
      void refetch()
    } catch (err) {
      alert('Error running migration: ' + (err as Error).message)
    } finally {
      setRunningMigrations((prev) => {
        const s = new Set(prev)
        s.delete(collectionKey)
        return s
      })
    }
  }

  const handleTestRoute = (route: RouteInfo, collectionKey: string) => {
    setPanel({ mode: 'routeTest', data: { route, collectionKey } })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-base">Registered Collections</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Code-based Gateway collections — read-only, managed in PHP
          </p>
        </div>
        {!isLoading && !isError && (
          <span className="text-[11px] text-gray-600 bg-gray-800/60 px-2.5 py-1 rounded-full">
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-600 text-sm">Loading collections…</p>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-700/30">
            <p className="text-red-400 text-sm">Failed to load collections. Make sure you are logged in as an admin.</p>
          </div>
        )}

        {!isLoading && !isError && collections.length === 0 && (
          <div className="flex items-center justify-center py-16 border-2 border-dashed border-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 text-sm">No registered collections found</p>
              <p className="text-gray-700 text-xs mt-1">Register collections using <code className="text-gray-500">YourCollection::register()</code></p>
            </div>
          </div>
        )}

        {!isLoading && !isError && collections.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {collections.map((col) => (
              <CollectionCard
                key={col.key}
                collection={col}
                onGenerateMigration={() => void handleGenerateMigration(col)}
                onRunMigration={() => void handleRunMigration(col.key)}
                onTestRoute={(route) => handleTestRoute(route, col.key)}
                isRunningMigration={runningMigrations.has(col.key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side panels */}
      {panel?.mode === 'migration' && (
        <MigrationPanel
          state={panel.data}
          onClose={() => setPanel(null)}
          onStateChange={(s) => setPanel({ mode: 'migration', data: s })}
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
