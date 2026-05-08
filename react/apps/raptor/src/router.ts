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
import CollectionsPageWithTabs from './pages/CollectionsPage'
import RegisteredCollectionsPage from './pages/RegisteredCollectionsPage'
import FieldsPage from './pages/Fields'
import ViewsPage from './pages/Views'
import ViewDesignPage from './pages/ViewDesign'
import FormsPage from './pages/Forms'
import FieldsTopLevelPage from './pages/FieldsTopLevel'
import ViewsTopLevelPage from './pages/ViewsTopLevel'
import FormsTopLevelPage from './pages/FormsTopLevel'
import SettingsPage from './pages/Settings'
import ConnectionSettingsPage from './pages/ConnectionSettings'
import DocsPage from './pages/Docs'
import RecordsIndexPage from './pages/records/RecordsIndex'
import RecordsListPage from './pages/records/RecordsList'
import RecordFormPage from './pages/records/RecordForm'
import RecordViewPage from './pages/records/RecordView'
import CollectionsRelationshipsPage from './pages/CollectionsRelationshipsPage'
import PackagesTopLevelPage from './pages/PackagesTopLevel'
import ExtensionShortcodesPage from './pages/ExtensionShortcodes'
import ShortcodesPage from './pages/ShortcodesPage'

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

const collectionsViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections',
  component: CollectionsPageWithTabs,
})

const registeredCollectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/registered',
  component: RegisteredCollectionsPage,
})

const collectionsRelationshipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collections/relationships',
  component: CollectionsRelationshipsPage,
})

const fieldsTopLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fields',
  component: FieldsTopLevelPage,
})

// Hidden from nav — restore nav links in Sidebar.tsx to re-enable
const viewsTopLevelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/views', component: ViewsTopLevelPage })
const formsTopLevelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/forms', component: FormsTopLevelPage })

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

export const extensionShortcodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extensions/$key/shortcodes',
  component: ExtensionShortcodesPage,
})

const shortcodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shortcodes',
  component: ShortcodesPage,
})

const packagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/packages',
  component: PackagesTopLevelPage,
})

// Hidden from nav — restore nav links in Sidebar.tsx to re-enable
export const viewsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/collections/$collectionKey/views', component: ViewsPage })
export const viewDesignRoute = createRoute({ getParentRoute: () => rootRoute, path: '/collections/$collectionKey/views/$viewKey/design', component: ViewDesignPage })
export const formsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/collections/$collectionKey/forms', component: FormsPage })

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const connectionSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/connection',
  component: ConnectionSettingsPage,
})

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: DocsPage,
})

// ─── Records routes ───────────────────────────────────────────────────────────

export const recordsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records',
  component: RecordsIndexPage,
})

export const recordsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records/$collectionKey',
  component: RecordsListPage,
})

export const recordCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records/$collectionKey/create',
  component: RecordFormPage,
})

export const recordEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records/$collectionKey/edit/$id',
  component: RecordFormPage,
})

export const recordViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records/$collectionKey/view/$id',
  component: RecordViewPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  collectionsViewerRoute,
  registeredCollectionsRoute,
  collectionsRelationshipsRoute,
  fieldsTopLevelRoute,
  formsTopLevelRoute,
  viewsTopLevelRoute,
  extensionsRoute,
  extensionShortcodesRoute,
  shortcodesRoute,
  packagesRoute,
  fieldsRoute,
  formsRoute,
  viewsRoute,
  viewDesignRoute,
  settingsRoute,
  connectionSettingsRoute,
  docsRoute,
  recordsIndexRoute,
  recordsListRoute,
  recordCreateRoute,
  recordEditRoute,
  recordViewRoute,
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
