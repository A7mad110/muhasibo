import axios from 'axios';

const storedUrl = localStorage.getItem('api_url');
const API = axios.create({
  baseURL: storedUrl || import.meta.env.VITE_API_URL || 'https://muhasibo.onrender.com/api',
  timeout: 25000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('lang') || 'ar';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = lang;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/muhasibo/login';
    }
    return Promise.reject(err);
  }
);

export default API;
