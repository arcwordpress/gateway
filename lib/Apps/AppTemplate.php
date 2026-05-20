<?php

namespace Gateway\Apps;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generates the predetermined no-build Preact app output.
 *
 * buildIndex() → standalone index.html (mounts on #app)
 * buildEmbed() → ES module for page embedding (mounts on #gateway-app-{key})
 *
 * Both use hash-based routing with two routes: / and /about.
 */
class AppTemplate
{
    public static function buildIndex(string $key): string
    {
        $k = esc_attr($key);
        $script = self::appScript($key, 'app');

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{$k}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e4e4e7; min-height: 100vh; }
    #app { display: flex; flex-direction: column; min-height: 100vh; }
    .gwa-nav { display: flex; align-items: center; gap: 12px; padding: 0 40px; height: 48px; background: #111113; border-bottom: 1px solid #27272a; }
    .gwa-nav__brand { font-size: 0.8125rem; font-weight: 700; color: #f4f4f5; margin-right: auto; }
    .gwa-nav__link { font-size: 0.8125rem; color: #a1a1aa; text-decoration: none; }
    .gwa-nav__link--active, .gwa-nav__link:hover { color: #f4f4f5; }
    .gwa-page { flex: 1; display: flex; flex-direction: column; gap: 16px; padding: 48px 40px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: #f4f4f5; margin: 0; }
    p { color: #a1a1aa; margin: 0; line-height: 1.6; }
    code { background: #27272a; border: 1px solid #3f3f46; border-radius: 4px; padding: 2px 6px; font-size: 0.875em; }
    .gwa-btn { padding: 10px 20px; font-size: 0.875rem; font-weight: 500; background: #18181b; color: #e4e4e7; border: 1px solid #3f3f46; border-radius: 6px; cursor: pointer; transition: background 0.12s, border-color 0.12s; }
    .gwa-btn:hover { background: #27272a; border-color: #52525b; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module">
{$script}
  </script>
</body>
</html>
HTML;
    }

    public static function buildEmbed(string $key): string
    {
        $containerId = 'gateway-app-' . esc_attr($key);
        return self::appScript($key, $containerId);
    }

    // -------------------------------------------------------------------------

    private static function appScript(string $key, string $containerId): string
    {
        // Use nowdoc to prevent PHP from interpolating ${...} inside the JS.
        // Key and containerId are spliced in via str_replace after.
        $template = <<<'JS'
    import { h, render } from 'https://esm.sh/preact@10.24.3';
    import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
    import htm from 'https://esm.sh/htm@3.1.1';

    const html = htm.bind(h);
    const KEY = '__KEY__';

    // ── Minimal hash router ────────────────────────────────────────────────────
    function useRoute() {
      const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');
      useEffect(() => {
        const handler = () => setRoute(window.location.hash.slice(1) || '/');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
      }, []);
      return route;
    }

    const navigate = (to) => { window.location.hash = to; };

    // ── Components ─────────────────────────────────────────────────────────────
    function Nav({ route }) {
      return html`
        <nav class="gwa-nav">
          <span class="gwa-nav__brand">${KEY}</span>
          <a href="#/" class=${'gwa-nav__link' + (route === '/' ? ' gwa-nav__link--active' : '')}>Home</a>
          <a href="#/about" class=${'gwa-nav__link' + (route === '/about' ? ' gwa-nav__link--active' : '')}>About</a>
        </nav>
      `;
    }

    function Home() {
      return html`
        <div class="gwa-page">
          <h1>Home</h1>
          <p>A no-build Preact app with hash-based client-side routing.</p>
          <button class="gwa-btn" onClick=${() => navigate('/about')}>Go to About →</button>
        </div>
      `;
    }

    function About() {
      return html`
        <div class="gwa-page">
          <h1>About</h1>
          <p>App key: <code>${KEY}</code></p>
          <button class="gwa-btn" onClick=${() => navigate('/')}>← Back to Home</button>
        </div>
      `;
    }

    function App() {
      const route = useRoute();
      return html`
        <${Nav} route=${route} />
        ${route === '/about' ? html`<${About} />` : html`<${Home} />`}
      `;
    }

    const container = document.getElementById('__CONTAINER_ID__');
    if (container) render(html`<${App} />`, container);
JS;

        return str_replace(
            ['__KEY__', '__CONTAINER_ID__'],
            [esc_js($key), esc_attr($containerId)],
            $template
        );
    }
}
