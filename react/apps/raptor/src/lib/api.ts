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
