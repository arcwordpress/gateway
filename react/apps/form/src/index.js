import { createRoot } from '@wordpress/element';
import { initializeFields } from '@arcwp/gateway-fields';
import App from './App';
import './index.css';

// Initialize field registry before rendering any components
// This must happen before any field components are used
initializeFields();

const formElements = document.querySelectorAll('[data-gateway-form]');
formElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-schema');
  const recordId = element.getAttribute('data-record-id');
  if (collectionKey) {
    const root = createRoot(element);
    root.render(<App collectionKey={collectionKey} recordId={recordId} />);
  }
});
