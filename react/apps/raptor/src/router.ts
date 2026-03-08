import {
  createRouter,
  createRoute,
  createRootRoute,
  createHashHistory,
  createBrowserHistory,
} from '@tanstack/react-router'

import { appConfig } from './config'
import Layout from './routes/Layout'
import DashboardPage from './pages/Dashboard'
import GraphPage from './pages/Graph'
// import CollectionsPage from './pages/Collections'
import CollectionsViewerPage from './pages/CollectionsViewer'
import FieldsPage from './pages/Fields'
import ViewsPage from './pages/Views'
import ViewDesignPage from './pages/ViewDesign'

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

const rootRoute = createRootRoute({ component: Layout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

/*
const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extensions/$extKey/collections',
  component: CollectionsPage,
})
*/

const collectionsViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections',
  component: CollectionsViewerPage,
})

export const fieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionKey/fields',
  component: FieldsPage,
})

const extensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extensions',
  component: GraphPage,
})

export const viewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionKey/views',
  component: ViewsPage,
})

export const viewDesignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionKey/views/$viewKey/design',
  component: ViewDesignPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  //collectionsRoute,
  collectionsViewerRoute,
  extensionsRoute,
  fieldsRoute,
  viewsRoute,
  viewDesignRoute,
])

const history = appConfig.isWordPress
  ? createHashHistory()
  : createBrowserHistory()

export const router = createRouter({ routeTree, history })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
