/**
 * @deprecated Use getApiClient from @arcwp/gateway-data instead.
 *
 * The production package handles auth priority (Basic Auth, WP nonce, headless)
 * automatically via window globals and request interceptors.
 *
 *   import { getApiClient } from '@arcwp/gateway-data';
 *   const api = getApiClient();
 */
