import { h, render } from 'preact';
import App from './App';
import './style.css';

function mount() {
  document.querySelectorAll('[data-gateway-grid]').forEach((el) => {
    const schema = el.getAttribute('data-schema');
    if (!schema) return;

    let config = {};
    try { config = JSON.parse(el.getAttribute('data-config') || '{}'); } catch {}

    const apiRoot = (window.gatewayBd && window.gatewayBd.apiRoot) || '/wp-json/';

    render(
      <App
        collectionKey={schema}
        apiRoot={apiRoot}
        showFilters={config.showFilters !== false}
        perPage={config.perPage || 20}
      />,
      el
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
