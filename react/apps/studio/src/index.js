import { render } from '@wordpress/element';
import App from './App';
import './index.css';

console.log('Admin app script loaded');

const rootElement = document.getElementById('gateway-admin-root');

console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Rendering app...');
  render(<App />, rootElement);
} else {
  console.error('Root element #gateway-admin-root not found');
}
