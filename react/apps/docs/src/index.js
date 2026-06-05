import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const rootElement = document.getElementById('gateway-app-docs');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
