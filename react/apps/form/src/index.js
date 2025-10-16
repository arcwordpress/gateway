import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Find all elements with data-blueprint-form attribute
const formElements = document.querySelectorAll('[data-blueprint-form]');

formElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-collection');
  const recordId = element.getAttribute('data-record-id');

  if (collectionKey) {
    const root = createRoot(element);
    root.render(<App collectionKey={collectionKey} recordId={recordId} />);
  }
});
