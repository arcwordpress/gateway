import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Import package styles
import '@arcwp/gateway-forms/style.css';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';
import '@arcwp/gateway-admin/style.css';

const rootElement = document.querySelector('[gateway-studio-app]');

if (rootElement) {
  // Get package from data attribute, default to 'default' if not specified
  const packageKey = rootElement.getAttribute('data-package') || 'default';

  // Get specific collection key if viewing an individual collection page
  const collectionKey = rootElement.getAttribute('data-collection') || null;

  const root = createRoot(rootElement);
  root.render(<App packageKey={packageKey} collectionKey={collectionKey} />);
} else {
  console.error('Root element with gateway-studio-app attribute not found');
}
