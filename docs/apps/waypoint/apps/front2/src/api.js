import axios from 'axios';
import { createApiClient } from '@arcwp/gateway-data';

const api = createApiClient(axios, {
    baseURL: window.waypointData?.apiUrl || '/wp-json/gateway/v1',
    nonce: window.waypointData?.nonce,
});

export default api;
