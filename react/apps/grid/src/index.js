import { createRoot } from '@wordpress/element';
import App, { AppGrid } from './App';

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

// Mount on every [data-gateway-grid] element — renders collection records without a view object
const gridElements = document.querySelectorAll('[data-gateway-grid]');

gridElements.forEach((element) => {
  const schema = element.getAttribute('data-schema');

  const configAttr = element.getAttribute('data-config');
  let config = {};
  if (configAttr) {
    try {
      config = JSON.parse(configAttr);
    } catch (e) {
      console.error('Failed to parse grid config:', e);
    }
  }

  if (schema) {
    const root = createRoot(element);
    root.render(
      <AppGrid
        collectionKey={schema}
        showFilters={config.showFilters !== false}
      />
    );
  }
});
