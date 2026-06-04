import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const rootElement = document.getElementById('waypoint-front2-app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
