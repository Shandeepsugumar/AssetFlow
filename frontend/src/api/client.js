/**
 * ============================================================
 * AssetFlow — Shared Axios API Client
 * ============================================================
 * EVERY module in the app should import this client for API calls.
 * It automatically injects the JWT token and handles 401 responses.
 *
 * Usage:
 *   import client from '../api/client';
 *   const res = await client.get('/some-endpoint');
 *
 * Or use the higher-level endpoint functions from endpoints.js:
 *   import { authApi } from '../api/endpoints';
 *   const result = await authApi.login(email, password);
 * ============================================================
 */

import axios from 'axios';

// Base URL — configurable via environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Feature flag: set to true to use mock data instead of the real API.
 * Toggle via VITE_USE_MOCKS env var, defaults to true for development.
 * Set to 'false' in .env to hit the real backend:
 *   VITE_USE_MOCKS=false
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor: inject JWT token ───────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('assetflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 Unauthorized ───────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('assetflow_token');
      localStorage.removeItem('assetflow_user');
      // Only redirect if not already on auth pages
      const path = window.location.pathname;
      if (
        !path.startsWith('/login') &&
        !path.startsWith('/signup') &&
        !path.startsWith('/forgot-password') &&
        !path.startsWith('/reset-password')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
