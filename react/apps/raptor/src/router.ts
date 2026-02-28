import {
  createRouter,
  createRoute,
  createRootRoute,
  createHashHistory,
  createBrowserHistory,
} from '@tanstack/react-router'

import { appConfig } from './config'
import RootLayout from './routes/__root'
import DashboardPage from './pages/Dashboard'
import GraphPage from './pages/Graph'

// For WP admin: set the initial hash route from the PHP-injected data-route
// attribute before the router reads window.location.hash
if (appConfig.isWordPress) {
  const rootEl = document.getElementById('gateway-raptor-root')
  const initialRoute = rootEl?.dataset.route ?? '/'
  if (!window.location.hash || window.location.hash === '#') {
    window.location.replace(
      window.location.href.split('#')[0] + '#' + initialRoute,
    )
  }
}

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/graph',
  component: GraphPage,
})

const routeTree = rootRoute.addChildren([indexRoute, graphRoute])

const history = appConfig.isWordPress
  ? createHashHistory()
  : createBrowserHistory()

export const router = createRouter({ routeTree, history })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
