import { appConfig } from '../config'

function apiUrl(path: string): string {
  return appConfig.apiUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}

function headers(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (appConfig.nonce) h['X-WP-Nonce'] = appConfig.nonce
  return h
}

export type LogEntry = { level: 'info' | 'success' | 'error'; message: string }

export type SaveResult = {
  success: boolean
  key: string
  log: LogEntry[]
  files: { path: string; bytes: number }[]
  errors: string[]
  url?: string
}

export async function saveApp(key: string): Promise<SaveResult> {
  const res = await fetch(apiUrl('gateway/v1/apps/save'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ key }),
  })
  return res.json() as Promise<SaveResult>
}
