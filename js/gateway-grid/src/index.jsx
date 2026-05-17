import { h, render } from 'preact';
import App from './App';
import './style.css';

function mountElement(el) {
  const schema = el.getAttribute('data-schema');
  if (!schema) return;

  let config = {};
  try { config = JSON.parse(el.getAttribute('data-config') || '{}'); } catch {}

  const apiRoot = (window.gatewayBd && window.gatewayBd.apiRoot) || '/wp-json/';

  const allViews    = ['table', 'list', 'cards'];
  const enabledViews = Array.isArray(config.enabledViews) && config.enabledViews.length
    ? config.enabledViews.filter(v => allViews.includes(v))
    : allViews;
  const defaultView   = enabledViews.includes(config.defaultView) ? config.defaultView : enabledViews[0];
  const hiddenFields        = Array.isArray(config.hiddenFields) ? config.hiddenFields : [];
  const recordViewMode      = config.recordViewMode || 'modal';
  const recordLinkPattern   = config.recordLinkPattern || '';
  const actionsEnabled      = config.actionsEnabled === true;
  const actionRoles         = Array.isArray(config.actionRoles) ? config.actionRoles : ['administrator'];
  const createActionEnabled = config.createActionEnabled === true;
  const createActionRoles   = Array.isArray(config.createActionRoles) ? config.createActionRoles : ['administrator'];
  const updateActionEnabled = config.updateActionEnabled === true;
  const updateActionRoles   = Array.isArray(config.updateActionRoles) ? config.updateActionRoles : ['administrator'];

  render(
    <App
      collectionKey={schema}
      apiRoot={apiRoot}
      showFilters={config.showFilters !== false}
      perPage={config.perPage || 20}
      colorScheme={config.colorScheme === 'dark' ? 'dark' : 'light'}
      showFacetToggle={config.showFacetToggle !== false}
      defaultView={defaultView}
      enabledViews={enabledViews}
      hiddenFields={hiddenFields}
      recordViewMode={recordViewMode}
      recordLinkPattern={recordLinkPattern}
      actionsEnabled={actionsEnabled}
      actionRoles={actionRoles}
      createActionEnabled={createActionEnabled}
      createActionRoles={createActionRoles}
      updateActionEnabled={updateActionEnabled}
      updateActionRoles={updateActionRoles}
    />,
    el
  );
}

function mount() {
  document.querySelectorAll('[data-gateway-grid]').forEach(mountElement);
}

// Elementor editor: remount whenever the widget is rendered or settings change.
// Elementor replaces the DOM node on each settings change, so render() starts fresh.
window.addEventListener('elementor/frontend/init', () => {
  window.elementorFrontend.hooks.addAction(
    'frontend/element_ready/gateway_grid.default',
    ($scope) => {
      $scope[0].querySelectorAll('[data-gateway-grid]').forEach(mountElement);
    }
  );
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
