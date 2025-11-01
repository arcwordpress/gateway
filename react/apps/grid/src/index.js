import { createRoot } from '@wordpress/element';
import { initializeFields } from '@arcwp/gateway-fields';
import App from './App';

// Initialize field registry before rendering any components
// This must happen before any field components are used
initializeFields();

// Find all elements with data-gateway-grid attribute
const gridElements = document.querySelectorAll('[data-gateway-grid]');

gridElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-collection');

  // Read optional config from data-config attribute
  const configAttr = element.getAttribute('data-config');
  let config = {};

  if (configAttr) {
    try {
      config = JSON.parse(configAttr);
    } catch (e) {
      console.error('Failed to parse grid config:', e);
    }
  }

  if (collectionKey) {
    const root = createRoot(element);
    root.render(
      <App
        collectionKey={collectionKey}
        showFilters={config.showFilters !== false} // Default to true unless explicitly false
        externalFilters={config.externalFilters || {}}
      />
    );
  }
});
