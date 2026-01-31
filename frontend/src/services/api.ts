import axios from 'axios';

const isProduction = import.meta.env.PROD;
let baseURL = import.meta.env.VITE_API_URL || (isProduction
    ? 'https://phantom-backend-qmci.onrender.com/api/'
    : 'http://192.168.31.59:5000/api/');

if (!baseURL.endsWith('/')) {
    baseURL += '/';
}

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
