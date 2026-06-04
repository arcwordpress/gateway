import axios from 'axios';
import { getApiClient } from '@arcwp/gateway/data';

const api = getApiClient(axios, {
    baseURL: window.gatewayDocsData?.apiUrl || '/wp-json/gateway/v1',
    nonce: window.gatewayDocsData?.nonce,
});

export default api;
