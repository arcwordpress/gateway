import { createRoot } from '@wordpress/element';
import App from './App';
import './index.css';

// Import package styles
import '@arcwp/gateway-forms/style.css';
import '@arcwp/gateway-grids/style.css';
import '@arcwp/gateway-grids/board-styles.css';
import '@arcwp/gateway-admin/style.css';

const rootElement = document.querySelector('[gateway-studio-app]');

if (rootElement) {
  // Dark-mode takeover — force the WP admin shell to match our dark theme
  const darkBg = '#09090b';

  const wpBodyContent = document.querySelector('#wpbody-content');
  if (wpBodyContent) {
    wpBodyContent.style.backgroundColor = darkBg;
    wpBodyContent.style.paddingBottom = '0';
  }

  const wpBody = document.querySelector('#wpbody');
  if (wpBody) wpBody.style.backgroundColor = darkBg;

  const wpContent = document.querySelector('#wpcontent');
  if (wpContent) wpContent.style.backgroundColor = darkBg;

  const wpWrap = document.querySelector('#wpwrap');
  if (wpWrap) wpWrap.style.backgroundColor = darkBg;

  document.body.style.backgroundColor = darkBg;

  const wpFooter = document.getElementById('wpfooter');
  if (wpFooter) wpFooter.style.display = 'none';

  // Get package from data attribute, default to 'default' if not specified
  const packageKey = rootElement.getAttribute('data-package') || 'default';

  const root = createRoot(rootElement);
  root.render(<App packageKey={packageKey} />);
} else {
  console.error('Root element with gateway-studio-app attribute not found');
}
