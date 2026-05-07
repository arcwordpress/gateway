import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { router } from './router'
import { SnackbarProvider } from './context/snackbar'
import './styles/globals.css'
import '@arcwp/gateway-grids/style.css'

// Bridge raptorConfig → gatewayAdminScript so the studio packages
// (@arcwp/gateway-data, gateway-forms, gateway-grids) can find auth config.
if (window.raptorConfig && !(window as Window & { gatewayAdminScript?: unknown }).gatewayAdminScript) {
  (window as unknown as Window & { gatewayAdminScript: { apiUrl: string; nonce: string } }).gatewayAdminScript = {
    apiUrl: window.raptorConfig.apiUrl,
    nonce: window.raptorConfig.nonce,
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
})

const rootElement = document.getElementById('gateway-raptor-root')

if (rootElement) {
  // Apply dark mode to our root so Tailwind dark: variants activate
  rootElement.classList.add('dark')

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}
