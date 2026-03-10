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
import FormsPage from './pages/Forms'
import FieldsTopLevelPage from './pages/FieldsTopLevel'
import ViewsTopLevelPage from './pages/ViewsTopLevel'
import FormsTopLevelPage from './pages/FormsTopLevel'
import SettingsPage from './pages/Settings'

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

const fieldsTopLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fields',
  component: FieldsTopLevelPage,
})

const viewsTopLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/views',
  component: ViewsTopLevelPage,
})

const formsTopLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forms',
  component: FormsTopLevelPage,
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

export const formsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/$collectionKey/forms',
  component: FormsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  //collectionsRoute,
  collectionsViewerRoute,
  fieldsTopLevelRoute,
  formsTopLevelRoute,
  viewsTopLevelRoute,
  extensionsRoute,
  fieldsRoute,
  formsRoute,
  viewsRoute,
  viewDesignRoute,
  settingsRoute,
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
