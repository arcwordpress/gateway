import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Find all elements with data-blueprint-form attribute
const formElements = document.querySelectorAll('[data-blueprint-form]');

formElements.forEach((element) => {
  const schemaKey = element.getAttribute('data-schema');
  const recordId = element.getAttribute('data-record-id');

  if (schemaKey) {
    const root = createRoot(element);
    root.render(<App schemaKey={schemaKey} recordId={recordId} />);
  }
});
