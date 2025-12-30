import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const rootElement = document.getElementById('gateway-admin-root');

if (rootElement) {
  console.log('Rendering app...');
  createRoot(rootElement).render(<App />);
} else {
  console.error('Root element #gateway-admin-root not found');
}
