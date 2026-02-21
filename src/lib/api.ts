import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('pengu_final_v4_user') || 'null');
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
