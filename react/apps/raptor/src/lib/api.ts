import { appConfig } from '../config'

/** Build a full API URL from a path like 'gateway/v1/extensions' */
export function apiUrl(path: string): string {
  const base = appConfig.apiUrl.replace(/\/$/, '')
  const clean = path.replace(/^\//, '')
  return `${base}/${clean}`
}

/** Auth headers for every fetch — nonce in WP, nothing in standalone (dev) */
export function authHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (appConfig.nonce) {
    headers['X-WP-Nonce'] = appConfig.nonce
  }
  return headers
}

/** Generate a UUID v4. Uses crypto.randomUUID when available (secure contexts),
 *  falls back to Math.random-based generation for HTTP / non-secure contexts. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
