import { render } from '@wordpress/element';
import App from './App';
import './index.css';

const rootElement = document.getElementById('gateway-admin-root');

if (rootElement) {
  render(<App />, rootElement);
}
