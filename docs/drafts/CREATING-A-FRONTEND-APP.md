# Creating a Gateway Frontend App (JS)

This covers the JavaScript side only — setting up the package, writing the entry point, and producing the build output that Gateway expects. For PHP registration see `REGISTERING-A-FRONTEND-APP.md`.

Gateway reads a fixed set of filenames from your build directory (`index.js`, `index.asset.php`, `index.css`, `style-index.css`). These are produced by `@wordpress/scripts` — **do not use Vite, Create React App, or any other bundler**. `wp-scripts` is the only supported toolchain.

---

## 1. Create the directory

```
your-plugin/
  apps/
    my-app/
      src/
        index.js
        App.js
        index.css
      package.json
```

The `build/` directory is generated — don't create it manually.

---

## 2. Write `package.json`

Copy this exactly and swap the `name`:

```json
{
  "name": "my-app",
  "scripts": {
    "build": "wp-scripts build src/index.js --output-path=build",
    "start": "wp-scripts start src/index.js --output-path=build"
  },
  "devDependencies": {
    "@wordpress/scripts": "^27.0.0"
  },
  "dependencies": {
    "@arcwp/gateway": "file:../../../gateway/react/packages/gateway",
    "@wordpress/element": "^5.0.0",
    "react-router-dom": "^7.0.0"
  }
}
```

The `@arcwp/gateway` path assumes your plugin lives alongside the Gateway plugin (e.g. `wp-content/plugins/your-plugin/apps/my-app/package.json`). Adjust the relative path if your directory layout differs — it must resolve to `gateway/react/packages/gateway`.

Add any other packages you need under `dependencies`, then install:

```bash
npm install
```

---

## 3. Write `src/index.js`

This is your entry point. Mount into the element ID that matches your app's `$key`:

```js
import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const root = document.getElementById('gateway-app-my-app');

if (root) {
    createRoot(root).render(<App />);
}
```

Replace `my-app` with whatever `$key` you set in your PHP class.

---

## 4. Write `src/App.js`

Read `basePath` from the localized global (set by your PHP class's `$localizeKey`):

```js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';

const basename = window.myAppData?.basePath || '/';

function App() {
    return (
        <Router basename={basename}>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;
```

Replace `myAppData` with your `$localizeKey`. Add routes as needed.

---

## 5. Install and build

```bash
npm install      # install dependencies (including @arcwp/gateway local package)
npm run build    # production build → build/
npm run start    # watch mode for development
```

After a successful build, `build/` will contain:

```
build/
  index.js
  index.asset.php   ← required for correct WP script dependencies
  index.css         ← if you import CSS
  style-index.css   ← component styles (if any)
```

If `index.asset.php` is missing, Gateway falls back to `filemtime()` versioning and an empty dependency list — always build with `wp-scripts` to generate it.

---

## Notes

- **JSX works out of the box** — `wp-scripts` is pre-configured for it, no Babel config needed.
- **`react` and `react-dom` are not in your bundle** — `wp-scripts` externalizes them; WordPress loads them as shared dependencies. Don't import them directly; use `@wordpress/element` instead.
- **CSS**: a single `import './index.css'` in `index.js` is enough. `wp-scripts` splits component-level CSS into `style-index.css` automatically.
- **Tailwind**: add `tailwindcss` and `@tailwindcss/postcss` to `devDependencies` and add a `postcss.config.js` — see the Docs app (`react/apps/docs/`) as a reference.
