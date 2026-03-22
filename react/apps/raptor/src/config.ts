declare global {
  interface Window {
    raptorConfig?: {
      apiUrl: string
      nonce: string
      version: string
      isWordPress: true
      schemaUrl: string
      /** False when Gateway tables don't exist yet (wrong DB driver, first install, etc.) */
      dbReady?: boolean
      /** Current DB driver from wp_options / auto-detect */
      dbDriver?: string
      /** Current connection port from wp_options */
      connectionPort?: string
    }
  }
}

export type AppConfig = {
  isWordPress: boolean
  apiUrl: string
  nonce: string | null
  version: string
  /** Full URL to schemas/raptor/extension.json */
  schemaUrl: string
  /** True when Gateway database tables exist and are ready to use */
  dbReady: boolean
  /** Current DB driver (mysql | sqlite) */
  dbDriver: string
  /** Current connection port (empty string = default) */
  connectionPort: string
}

function buildConfig(): AppConfig {
  if (typeof window !== 'undefined' && window.raptorConfig) {
    return {
      isWordPress: true,
      apiUrl: window.raptorConfig.apiUrl,
      nonce: window.raptorConfig.nonce,
      version: window.raptorConfig.version,
      schemaUrl: window.raptorConfig.schemaUrl,
      dbReady: window.raptorConfig.dbReady ?? true,
      dbDriver: window.raptorConfig.dbDriver ?? 'mysql',
      connectionPort: window.raptorConfig.connectionPort ?? '',
    }
  }
  return {
    isWordPress: false,
    apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/wp-json',
    nonce: null,
    version: import.meta.env.VITE_VERSION ?? 'dev',
    // Vite serves /public at root — schema lives in public/schemas/raptor/
    schemaUrl: import.meta.env.VITE_SCHEMA_URL ?? '/schemas/raptor/extension.json',
    dbReady: true,
    dbDriver: 'mysql',
    connectionPort: '',
  }
}

export const appConfig = buildConfig()
