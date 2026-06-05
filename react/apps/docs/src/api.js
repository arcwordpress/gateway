import { getApiClient } from '@arcwp/gateway';

// Bridge gatewayDocsData into the shape getApiClient expects.
if (window.gatewayDocsData && !window.gatewayAdminScript) {
    window.gatewayAdminScript = {
        apiUrl: window.gatewayDocsData.apiUrl,
        nonce:  window.gatewayDocsData.nonce,
    };
}

const api = getApiClient();

export default api;
