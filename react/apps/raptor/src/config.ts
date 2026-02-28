declare global {
  interface Window {
    raptorConfig?: {
      apiUrl: string
      nonce: string
      version: string
      isWordPress: true
    }
  }
}

export type AppConfig = {
  isWordPress: boolean
  apiUrl: string
  nonce: string | null
  version: string
}

function buildConfig(): AppConfig {
  if (typeof window !== 'undefined' && window.raptorConfig) {
    return {
      isWordPress: true,
      apiUrl: window.raptorConfig.apiUrl,
      nonce: window.raptorConfig.nonce,
      version: window.raptorConfig.version,
    }
  }
  return {
    isWordPress: false,
    apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/wp-json',
    nonce: null,
    version: import.meta.env.VITE_VERSION ?? 'dev',
  }
}

export const appConfig = buildConfig()
