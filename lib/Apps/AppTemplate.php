<?php

namespace Gateway\Apps;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generates the predetermined no-build Preact app for page embedding.
 *
 * buildEmbed()  → embed.js   ES module, mounts on #gateway-app-{key}
 * buildStyles() → embed.css  scoped styles for the embedded app
 */
class AppTemplate
{
    public static function buildEmbed(string $key): string
    {
        $containerId = 'gateway-app-' . esc_attr($key);

        // Nowdoc prevents PHP from touching any ${...} inside the JS.
        // __KEY__ and __CONTAINER_ID__ are substituted after.
        $template = <<<'JS'
import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(h);
const KEY = '__KEY__';
const ROOT = '__CONTAINER_ID__';

// ── Minimal hash router ──────────────────────────────────────────────────────
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

// ── Components ───────────────────────────────────────────────────────────────
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
      <h1 class="gwa-heading">Home</h1>
      <p class="gwa-text">A no-build Preact app with hash-based client-side routing.</p>
      <button class="gwa-btn" onClick=${() => navigate('/about')}>Go to About →</button>
    </div>
  `;
}

function About() {
  return html`
    <div class="gwa-page">
      <h1 class="gwa-heading">About</h1>
      <p class="gwa-text">App key: <code class="gwa-code">${KEY}</code></p>
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

const container = document.getElementById(ROOT);
if (container) render(html`<${App} />`, container);
JS;

        return str_replace(
            ['__KEY__', '__CONTAINER_ID__'],
            [esc_js($key), esc_attr($containerId)],
            $template
        );
    }

    public static function buildStyles(): string
    {
        // All selectors are prefixed with .gwa-* so nothing leaks into the host page.
        return <<<'CSS'
.gwa-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  height: 48px;
  background: #111113;
  border-bottom: 1px solid #27272a;
  box-sizing: border-box;
}
.gwa-nav__brand {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #f4f4f5;
  margin-right: auto;
  font-family: system-ui, -apple-system, sans-serif;
}
.gwa-nav__link {
  font-size: 0.8125rem;
  color: #a1a1aa;
  text-decoration: none;
  font-family: system-ui, -apple-system, sans-serif;
}
.gwa-nav__link--active,
.gwa-nav__link:hover { color: #f4f4f5; }

.gwa-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 32px;
  box-sizing: border-box;
}
.gwa-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f4f4f5;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.3;
}
.gwa-text {
  color: #a1a1aa;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.9375rem;
}
.gwa-code {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.875em;
  color: #e4e4e7;
}
.gwa-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: system-ui, -apple-system, sans-serif;
  background: #18181b;
  color: #e4e4e7;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  align-self: flex-start;
}
.gwa-btn:hover { background: #27272a; border-color: #52525b; }
CSS;
    }
}
