const SKIP_NAMES = new Set(['id', 'created_at', 'updated_at', 'deleted_at']);
const SKIP_TYPES = new Set(['relation', 'relationship', 'file', 'image', 'gallery']);

export function getFormFields(collection) {
  const raw      = collection.fields || {};
  const fillable = Array.isArray(collection.fillable) ? new Set(collection.fillable) : null;

  const entries = Array.isArray(raw)
    ? raw.map(f => [f.name, f])
    : Object.entries(raw);

  return entries.filter(([key, field]) => {
    if (SKIP_NAMES.has(key)) return false;
    if (SKIP_TYPES.has(field.type)) return false;
    if (field.hidden) return false;
    if (fillable && !fillable.has(key)) return false;
    return true;
  });
}

export function defaultFor(field) {
  if (field.type === 'boolean' || field.type === 'checkbox') return false;
  return '';
}

export function formReducer(state, action) {
  if (action.type === 'SET') return { ...state, [action.field]: action.value };
  if (action.type === 'RESET') return action.payload;
  return state;
}

export function normalizeApiRoot(apiRoot) {
  return apiRoot ? apiRoot.replace(/\/?$/, '/') : '/wp-json/';
}

export function buildRouteUrl(apiRoot, route) {
  const base = normalizeApiRoot(apiRoot);
  return base + route.replace(/^\//, '');
}

export function buildUpdateUrl(collection, apiRoot, recordId) {
  const routes = Array.isArray(collection.routes) ? collection.routes : [];
  const update = routes.find(r => r.type === 'update');
  const del    = routes.find(r => r.type === 'delete');
  const create = routes.find(r => r.type === 'create');
  const base   = update || del || create;
  if (!base) return null;
  // Strip WP REST regex tail (e.g. /(?P<id>\d+)) or {placeholder}
  const path = base.route
    .replace(/\/\(\?P<[^>]+>[^)]+\)$/, '')
    .replace(/\/\{[^}]+\}$/, '');
  return buildRouteUrl(apiRoot, path) + recordId;
}
