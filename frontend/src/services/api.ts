import axios from 'axios';

// Bulletproof baseURL logic:
// Ensure the request ALWAYS goes to the /api/ prefix, even if VITE_API_URL is missing it.
let rawBaseURL = import.meta.env.VITE_API_URL || 'https://phantom-backend-qmci.onrender.com/api/';

let finalBaseURL = rawBaseURL.trim();
if (!finalBaseURL.includes('/api')) {
    finalBaseURL = finalBaseURL.replace(/\/$/, '') + '/api/';
}
if (!finalBaseURL.endsWith('/')) {
    finalBaseURL += '/';
}

console.log('API Initialized with baseURL:', finalBaseURL);

const api = axios.create({
    baseURL: finalBaseURL,
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
