import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Find all elements with data-gateway-grid attribute
const gridElements = document.querySelectorAll('[data-gateway-grid]');

gridElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-collection');

  if (collectionKey) {
    const root = createRoot(element);
    root.render(<App collectionKey={collectionKey} />);
  }
});
