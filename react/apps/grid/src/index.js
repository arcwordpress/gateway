import { createRoot } from '@wordpress/element';
import App from './App';

// Mount on every [data-gateway-view] element on the page
const viewElements = document.querySelectorAll('[data-gateway-view]');

viewElements.forEach((element) => {
  const viewKey = element.getAttribute('data-view');

  const configAttr = element.getAttribute('data-config');
  let config = {};

  if (configAttr) {
    try {
      config = JSON.parse(configAttr);
    } catch (e) {
      console.error('Failed to parse view config:', e);
    }
  }

  if (viewKey) {
    const root = createRoot(element);
    root.render(
      <App
        viewKey={viewKey}
        showFilters={config.showFilters !== false}
      />
    );
  }
});
