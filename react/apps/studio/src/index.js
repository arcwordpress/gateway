import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Import package styles
import '@arcwp/gateway-forms/style.css';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';

const rootElement = document.getElementById('gateway-admin-root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error('Root element #gateway-admin-root not found');
}
