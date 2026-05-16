import { h, render } from 'preact';
import App from './App';
import './style.css';

function mountElement(el) {
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
}

function mount() {
  document.querySelectorAll('[data-gateway-grid]').forEach(mountElement);
}

// Elementor editor: remount whenever the widget is rendered or settings change.
// Elementor replaces the DOM node on each settings change, so render() starts fresh.
window.addEventListener('elementor/frontend/init', () => {
  window.elementorFrontend.hooks.addAction(
    'frontend/element_ready/gateway_grid.default',
    ($scope) => {
      $scope[0].querySelectorAll('[data-gateway-grid]').forEach(mountElement);
    }
  );
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
