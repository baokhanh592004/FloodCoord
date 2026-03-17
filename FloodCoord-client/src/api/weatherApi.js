import axios from 'axios';

/**
 * Axios instance for the FloodCoord weather/flood API.
 * Base URL is read from Vite env variable so it works in dev, docker, and prod.
 *
 * Usage: import weatherApi from '@/api/weatherApi'
 */
const weatherApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083'}/api`,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically if present
weatherApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error logging
weatherApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message;
    console.error('[WeatherAPI Error]', msg);
    return Promise.reject(error);
  }
);

export default weatherApi;