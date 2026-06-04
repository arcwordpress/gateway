function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import axios from 'axios';

/**
 * Get API configuration from window globals or provided config
 */
var getApiConfig = function getApiConfig() {
  var _window$gatewayAdminS;
  var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var apiUrl = overrides.apiUrl || ((_window$gatewayAdminS = window.gatewayAdminScript) === null || _window$gatewayAdminS === void 0 ? void 0 : _window$gatewayAdminS.apiUrl) || '/wp-json/';
  return {
    apiUrl,
    auth: overrides.auth || null
  };
};

/**
 * Get authentication headers based on priority:
 * 1. Provided auth options
 * 2. window.gatewayAuth (Basic Auth for headless)
 * 3. window.gatewayAdminScript.nonce (WordPress nonce)
 */
var getAuthHeaders = function getAuthHeaders() {
  var _window$gatewayAuth, _window$gatewayAuth2, _window$gatewayAdminS2;
  var authOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var headers = {};
  var suppressCredentials = false;

  // Priority 1: Use provided auth options
  if (authOptions !== null && authOptions !== void 0 && authOptions.username && authOptions !== null && authOptions !== void 0 && authOptions.password) {
    var credentials = btoa("".concat(authOptions.username, ":").concat(authOptions.password));
    headers['Authorization'] = "Basic ".concat(credentials);
    suppressCredentials = true;
  }
  // Priority 2: Check for window.gatewayAuth (headless environment)
  else if ((_window$gatewayAuth = window.gatewayAuth) !== null && _window$gatewayAuth !== void 0 && _window$gatewayAuth.username && (_window$gatewayAuth2 = window.gatewayAuth) !== null && _window$gatewayAuth2 !== void 0 && _window$gatewayAuth2.password) {
    var _credentials = btoa("".concat(window.gatewayAuth.username, ":").concat(window.gatewayAuth.password));
    headers['Authorization'] = "Basic ".concat(_credentials);
    suppressCredentials = true;
  }
  // Priority 3: Check for WordPress nonce in gatewayAdminScript only
  else if ((_window$gatewayAdminS2 = window.gatewayAdminScript) !== null && _window$gatewayAdminS2 !== void 0 && _window$gatewayAdminS2.nonce) {
    headers['X-WP-Nonce'] = window.gatewayAdminScript.nonce;
  }
  return {
    headers,
    suppressCredentials
  };
};

/**
 * Create and configure the API client
 */
export var createApiClient = function createApiClient() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _getApiConfig = getApiConfig(config),
    apiUrl = _getApiConfig.apiUrl;
  var client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor - add authentication headers
  client.interceptors.request.use(requestConfig => {
    // Check for per-request auth override in requestConfig.auth
    // Priority: request-level auth > client-level auth > window globals
    var authToUse = requestConfig.auth || config.auth;
    var _getAuthHeaders = getAuthHeaders(authToUse),
      headers = _getAuthHeaders.headers,
      suppressCredentials = _getAuthHeaders.suppressCredentials;

    // Merge auth headers
    requestConfig.headers = _objectSpread(_objectSpread({}, requestConfig.headers), headers);

    // Suppress credentials for Basic Auth
    if (suppressCredentials) {
      requestConfig.withCredentials = false;
    }

    // Remove auth from request config to avoid axios trying to use it
    delete requestConfig.auth;
    return requestConfig;
  }, error => {
    return Promise.reject(error);
  });

  // Response interceptor - handle common errors
  client.interceptors.response.use(response => response, error => {
    var _error$response;
    if (((_error$response = error.response) === null || _error$response === void 0 ? void 0 : _error$response.status) === 401) {
      console.error('Authentication failed. Please check your credentials.');

      // Optionally trigger a custom event for global auth error handling
      window.dispatchEvent(new CustomEvent('gateway:auth:error', {
        detail: error
      }));
    }
    return Promise.reject(error);
  });
  return client;
};

// Export a singleton instance with default configuration
var defaultClient = null;
export var getApiClient = function getApiClient() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!defaultClient || Object.keys(config).length > 0) {
    defaultClient = createApiClient(config);
  }
  return defaultClient;
};

/**
 * Reset the default client (useful for testing or config changes)
 */
export var resetApiClient = () => {
  defaultClient = null;
};
export default {
  createApiClient,
  getApiClient,
  resetApiClient
};