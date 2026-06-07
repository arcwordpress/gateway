# Registering a Frontend React App (Gateway App)

This guide documents the **current** approach for building a standalone React SPA that mounts on a user-assigned WordPress page, using the `\Gateway\App` base class and `AppRegistry`. Gateway's own Docs app (`lib/Docs/Apps/DocsApp.php`) is the canonical example — read alongside this guide if you want to see real code.

Use this guide to build a **new** app, or to **migrate an older app** (one that hooks into WordPress directly with custom shortcodes, manual `wp_enqueue_script` calls, custom rewrite rules, etc.) onto the current registration approach.

## How the system works (read this first)

1. You write a PHP class that **extends `\Gateway\App`** and declare a few properties (`$key`, `$label`, build paths).
2. You call `YourApp::register()` once during plugin bootstrap. This pushes the instance into `\Gateway\Apps\AppRegistry`.
3. `AppRegistry::init()` (already called once by Gateway core in `Plugin.php`) wires up WordPress hooks that:
   - Expose your app as a **selectable page template** in the block editor (`theme_page_templates` filter).
   - Add **rewrite rules** so sub-paths under the assigned page (e.g. `/my-app/sub/path`) route back to that same page, letting your client-side router take over.
   - Swap in a **shared shell template** (`templates/gateway-app-shell.php`) when a page using your template is requested — this template just outputs an empty `<div id="...">` mount point and calls `get_header()`/`get_footer()`.
   - **Enqueue your built JS/CSS** and `wp_localize_script` a small data object (API URL, nonce, base path, plus anything you add) onto a JS global.
4. The site owner creates **any WordPress page**, assigns your app's template from the page template dropdown, and that page's permalink becomes your app's router base — automatically, regardless of what slug they pick.
5. Your React app reads the localized JS global, mounts into the shell's `<div>`, and runs its own client-side router using the provided `basePath`.

You do **not** need to: register custom rewrite rules yourself, manually enqueue scripts, create admin pages to host the app, or hardcode a URL slug.

## Step-by-step: registering a new app

### 1. Decide on a unique key and plan your directory layout

Pick a short, unique, lowercase-with-hyphens `key` (e.g. `'docs'`, `'studio'`, `'my-app'`). This key drives:
- the page template slug: `gateway-app-{key}`
- the mount element ID: `gateway-app-{key}`
- default script handle: `gateway-app-{key}`

Place your React app's source under `react/apps/{key}/` (for Gateway core) or your extension's equivalent React directory. The compiled output must land in a `build/` subdirectory there (e.g. `react/apps/{key}/build/`).

### 2. Create the App subclass

Extend `\Gateway\App` and implement the two abstract path methods plus whatever properties you need:

```php
<?php

namespace MyPlugin\Apps;

class MyApp extends \Gateway\App
{
    protected string $key         = 'my-app';
    protected string $label       = 'My App';
    protected string $localizeKey = 'myAppData';

    protected function getBuildDir(): string
    {
        return MY_PLUGIN_PATH . 'react/apps/my-app/build/';
    }

    protected function getBuildUrl(): string
    {
        return MY_PLUGIN_URL . 'react/apps/my-app/build/';
    }

    protected function localizeData(int $pageId, string $basePath): array
    {
        return [
            'isLoggedIn' => is_user_logged_in(),
            // Add anything your React app needs at boot time.
            // Avoid leaking sensitive data — this is rendered into page HTML.
        ];
    }
}
```

#### Properties reference

| Property | Required | Default | Purpose |
|----------|----------|---------|---------|
| `$key` | yes | — | Unique identifier; drives template slug, mount ID, script handle |
| `$label` | no | Title-cased `$key` | Display name in the page template dropdown |
| `$localizeKey` | no | `'gatewayAppData'` | JS global name the localized data object is attached to (e.g. `window.myAppData`) — **always set this explicitly** so multiple apps don't collide |
| `$scriptDeps` | no | `[]` | Extra WP script handles your bundle depends on, merged with the auto-detected dependencies from the asset manifest |
| `$scriptModule` | no | `true` | Whether to add `type="module"` to the `<script>` tag. Leave `true` for modern ESM bundles (the default Vite/wp-scripts ESM output) |

#### Methods you must implement (abstract)

| Method | Returns |
|--------|---------|
| `getBuildDir(): string` | Absolute filesystem path to the compiled build directory, **with trailing slash** |
| `getBuildUrl(): string` | Public URL to that same directory, **with trailing slash** |

#### Method you'll usually override

| Method | Purpose |
|--------|---------|
| `localizeData(int $pageId, string $basePath): array` | Return app-specific data merged into the localized JS object. The base class always supplies `apiUrl`, `nonce`, and `basePath` — you don't need to repeat those. |

### 3. Register the app on boot

Call `YourApp::register()` early during plugin initialization — **before or alongside** `AppRegistry::init()` (Gateway core already calls `Apps\AppRegistry::init()` once in `Plugin.php::boot()`; you do not call it again). The simplest place is your extension's own `init()` method, mirroring how Gateway's Docs module does it:

```php
namespace MyPlugin;

use MyPlugin\Apps\MyApp;

class MyPlugin
{
    public static function init(): void
    {
        MyApp::register();

        // ... register collections, migrations, etc.
    }
}
```

Then ensure `MyPlugin::init()` runs during your extension's bootstrap (typically on `gateway_plugin_loaded` or your plugin's own `init` hook — follow whatever convention your extension already uses for registering collections/extensions).

`register()` is a static method inherited from `\Gateway\App`. It does `AppRegistry::push(new static())` — no extra wiring needed.

### 4. Build your React app

Your React app is a standard WordPress `@wordpress/scripts` (or compatible bundler) project that:

1. **Reads the localized data global** to get `apiUrl`, `nonce`, `basePath`, and whatever else you returned from `localizeData()`.
2. **Mounts into the element with ID `gateway-app-{key}`**.
3. **Uses `basePath` as its router's basename**, so the app works correctly no matter what page slug the site owner chose.

Minimal `index.js`:

```js
import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const rootElement = document.getElementById('gateway-app-my-app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
```

Minimal `App.js` (using `react-router-dom`, matching the Docs app's pattern):

```js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/Home';

const basename = window.myAppData?.basePath || '/';

function App() {
    return (
        <Router basename={basename}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* add more routes; sub-paths route back to the same WP page
                    thanks to the rewrite rules AppRegistry adds */}
            </Routes>
        </Router>
    );
}

export default App;
```

Notes:
- The mount element ID and the localize key **must** match what your `App` subclass declares (`getMountId()` returns `gateway-app-{key}`; `$localizeKey` is whatever you set).
- `window.{localizeKey}.apiUrl` already points at `rest_url('gateway/v1')` — use it for REST calls.
- `window.{localizeKey}.nonce` is a `wp_rest` nonce — pass it as `X-WP-Nonce` for authenticated REST calls.

### 5. Wire up the build

Add a `package.json` with a `build` script that outputs to `build/` using `wp-scripts build`:

```json
{
  "name": "my-app",
  "scripts": {
    "build": "wp-scripts build src/index.js --output-path=build",
    "start": "wp-scripts start src/index.js --output-path=build"
  }
}
```

`wp-scripts build` generates `build/index.js`, `build/index.css` (if you import CSS), and critically **`build/index.asset.php`** — a PHP file returning `['dependencies' => [...], 'version' => '...']`. `AppRegistry::enqueueAssets()` reads this file to register the correct WordPress script dependencies (e.g. `wp-element`, `react`) and a content-hash version string. **Don't skip this** — without `index.asset.php`, the registry falls back to `filemtime()` for versioning and an empty dependency list.

### 6. Assign a page

Once your plugin is active and the app is registered:

1. In WP Admin, create (or edit) any Page.
2. In the page's **Template** dropdown (Page Attributes panel), select your app's `$label`.
3. Publish/update the page.

Gateway will:
- Detect the assigned template and serve the shared shell (`templates/gateway-app-shell.php`) instead of the page's normal theme template.
- Add a rewrite rule so any sub-path under that page's permalink routes back to the same `page_id`.
- Enqueue your built assets and localize your data, with `basePath` set to the page's permalink path.

You can verify registration via Gateway's Raptor reporting UI — registered apps appear under **Apps** in the sidebar (`GET /gateway/v1/apps`), showing the key, label, template slug, mount ID, and any pages currently assigned to it.

## Migrating an older app to this approach

If you have an existing React app that was wired up the "old way" — typically one or more of:

- A custom shortcode that outputs a mount `<div>` and manually enqueues scripts
- Direct `add_action('wp_enqueue_scripts', ...)` / `wp_enqueue_script()` calls scattered in plugin bootstrap
- Hardcoded rewrite rules via `add_rewrite_rule()` plus a `template_redirect` or `template_include` hook tailored to one app
- A fixed, hardcoded URL slug instead of a user-assignable page
- Manual `wp_localize_script()` calls with a bespoke data shape

...migrate it like this:

1. **Identify the build output.** Confirm the app already builds to a `build/` directory with `index.js` (and ideally `index.asset.php` from `wp-scripts build`). If it builds elsewhere, either move the output or override `getBuildDir()`/`getBuildUrl()` to point at the existing location — no need to relocate source files.

2. **Create the `App` subclass** (Step 2 above). Pull the `$localizeKey` name from whatever global your React entry point currently reads (e.g. if your `index.js` does `window.myOldGlobal`, set `$localizeKey = 'myOldGlobal'` so you don't have to touch the React side).

3. **Port `localizeData()`** from the old `wp_localize_script()` call. Drop `apiUrl`, `nonce`, and `basePath` if they were manually included — the base class supplies these automatically now. Keep everything else.

4. **Delete the old wiring**:
   - Remove the custom shortcode (unless still needed for embedding elsewhere — but prefer the page-template approach for full-page apps).
   - Remove manual `wp_enqueue_scripts` / `wp_enqueue_script` / `wp_enqueue_style` hook registrations for this app.
   - Remove custom `add_rewrite_rule()` calls and any `template_redirect`/`template_include`/`parse_request` hooks written specifically for this app. `AppRegistry` now owns this.
   - Remove any hardcoded "page must live at /this/exact/slug" assumptions in the React router — switch to reading `basePath` from the localized data and using it as the router `basename` (see Step 4 above). This is usually the only required React-side change.

5. **Register the app** (Step 3 above) — typically replacing whatever bootstrap call previously triggered the shortcode registration or manual enqueue.

6. **Re-point any internal links** that assumed a fixed slug. Since the app's base URL is now whatever permalink the site owner assigns, generate links from the running app's own `basePath` / router, or — if you need the URL from PHP — look up the assigned page via `get_posts()` filtering on `_wp_page_template = 'gateway-app-{key}'` (see `AppRegistry::getPagesForApp()` for the exact query shape, also exposed read-only via `GET /gateway/v1/apps`).

7. **Test the full flow**: assign a page, confirm the template appears in the dropdown, confirm the shell renders the mount div, confirm assets enqueue (check browser devtools for `gateway-app-{key}` script/style handles and the localized global), and confirm sub-path navigation (e.g. `/{assigned-slug}/some/route`) doesn't 404.

8. **Flush rewrite rules if routes still 404** after assigning the page. `AppRegistry::addRewriteRules()` only flushes when its fingerprint of (apps × assigned pages) changes, and that fingerprint is stored in the `gateway_app_rewrite_hash` option. If you're migrating in a dev environment where rules may be stale from the old setup, delete that option (`delete_option('gateway_app_rewrite_hash')`) or simply re-save the assigned page once — `AppRegistry::maybeFlusRewriteRules()` clears the hash on every save of a page using a `gateway-app-*` template, forcing a flush on the next `init`.

## Reference: what `AppRegistry` does for you

You generally don't need to read or modify `\Gateway\Apps\AppRegistry`, but understanding its hooks helps with debugging:

| Hook | Registry method | Purpose |
|------|----------------|---------|
| `theme_page_templates` | `addPageTemplates()` | Adds `gateway-app-{key} => $label` so the app shows in the template dropdown |
| `init` | `addRewriteRules()` | For each page assigned to an app template, adds a top-priority rewrite rule routing `{permalink}(/sub/path)?` back to `index.php?page_id={id}`; flushes rewrite rules only when the (app × page) fingerprint changes |
| `template_include` | `templateLoader()` | Detects if the current page uses a `gateway-app-*` template; if so, stashes the active `App` instance in `$GLOBALS['gateway_active_app']` and returns the shared shell template path |
| `wp_enqueue_scripts` | `enqueueAssets()` | Reads `index.asset.php`, enqueues `index.js`/`index.css`/`style-index.css` with correct deps/version, adds `type="module"` if requested, and calls `wp_localize_script()` with the merged data object |
| `save_post_page` | `maybeFlusRewriteRules()` | Clears the cached rewrite-rule fingerprint whenever a page using a `gateway-app-*` template is saved, so rules get re-flushed |

## Quick checklist

- [ ] Unique `$key` chosen; React source lives at a known `react/apps/{key}/` (or equivalent) path
- [ ] `App` subclass created with `getBuildDir()`, `getBuildUrl()`, `$key`, `$label`, `$localizeKey`
- [ ] `localizeData()` returns whatever your React app needs beyond `apiUrl`/`nonce`/`basePath`
- [ ] `YourApp::register()` called during bootstrap
- [ ] `index.js` mounts into `#gateway-app-{key}`
- [ ] React router uses `window.{localizeKey}.basePath` as its `basename`
- [ ] Build produces `build/index.js` (+ `index.asset.php` via `wp-scripts build`)
- [ ] Page assigned to the app's template in WP Admin; confirmed in **Apps** (Raptor sidebar) or `GET /gateway/v1/apps`
- [ ] Sub-path navigation works without 404s (flush rewrite rules / re-save page if not)
- [ ] Old shortcode/enqueue/rewrite-rule code for this app removed (migration only)
