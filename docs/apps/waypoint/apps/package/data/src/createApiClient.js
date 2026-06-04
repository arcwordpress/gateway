/**
 * Creates an axios instance pre-configured for WordPress REST API auth.
 * Caller supplies their own axios so the package stays dependency-free.
 */
export function createApiClient(axios, { baseURL, nonce } = {}) {
    return axios.create({
        baseURL: baseURL || '/wp-json/gateway/v1',
        headers: {
            'X-WP-Nonce': nonce || '',
        },
        withCredentials: true,
    });
}
