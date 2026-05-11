import { createRoot } from '@wordpress/element';
import ComposedGridShell from './ComposedGridShell';

/**
 * Mount on every [data-composed-grid] element.
 *
 * Usage in HTML / PHP:
 *   <div data-composed-grid data-schema="your-collection-key"></div>
 */
document.querySelectorAll('[data-composed-grid], [data-gateway-composed-grid]').forEach((element) => {
  const schema =
    element.getAttribute('data-schema') ||
    element.getAttribute('data-collection') ||
    element.getAttribute('data-collection-key');

  if (!schema) {
    element.innerHTML = '<div style="padding:8px;border:1px solid #fca5a5;background:#7f1d1d;color:#fecaca;border-radius:6px;">Composed Grid: missing data-schema (or data-collection)</div>';
    return;
  }

  const root = createRoot(element);
  root.render(<ComposedGridShell collectionKey={schema} />);
});
