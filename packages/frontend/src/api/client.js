import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Interceptor to automatically attach JWT token if it exists
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    // Auth
    requestOTP: (email) => client.post('/auth/request-otp', { email }),
    verifyOTP: (email, code) => client.post('/auth/verify-otp', { email, code }),
    
    // Monitors
    getMonitors: () => client.get('/monitor'),
    getMonitorDetails: (id) => client.get(`/monitor/${id}`),
    createMonitor: (data) => client.post('/monitor/create', data),
    
    // Reports
    getResults: (monitorId) => client.get(`/reports/${monitorId}`),
};
