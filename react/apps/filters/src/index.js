import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Find all elements with data-gateway-filters attribute
const filterElements = document.querySelectorAll('[data-gateway-filters]');

filterElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-collection');

  if (collectionKey) {
    const root = createRoot(element);
    root.render(<App collectionKey={collectionKey} />);
  }
});
