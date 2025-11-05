import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

const formElements = document.querySelectorAll('[data-gateway-form]');
formElements.forEach((element) => {
  const collectionKey = element.getAttribute('data-schema');
  const recordId = element.getAttribute('data-record-id');
  if (collectionKey) {
    const root = createRoot(element);
    root.render(<App collectionKey={collectionKey} recordId={recordId} />);
  }
});
