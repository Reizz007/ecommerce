/**
 * Centralized API URL and Fetch Utility
 *
 * Supports two deployment modes:
 * 1. Relative Mode (Default): When VITE_API_BASE_URL is empty, requests use relative paths
 *    like '/api/products' (ideal for local Vite dev proxy and Vercel/Nginx rewrites).
 * 2. Cross-Domain Mode: When VITE_API_BASE_URL is set (e.g., 'https://api.yourdomain.com'),
 *    requests automatically target the remote backend host.
 */

import { getDeviceHeaders } from './device';

/**
 * Returns dynamic backend base URL based on runtime environment.
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Local development with Vite dev server
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }

  // If the React app is served directly by the backend server (e.g. on Render / public folder)
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('backend') || window.location.port === '8000') {
      return '';
    }
  }

  // Fallback for standalone frontend deployments (dyzzstore.store, ecommerce-2smr, etc.)
  return 'https://backend-1-lawx.onrender.com';
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Resolves an endpoint path to a full API URL
 * @param {string} endpoint e.g. '/api/products' or 'api/orders'
 * @returns {string} Fully resolved URL
 */
export function apiUrl(endpoint) {
  const base = getApiBaseUrl();
  if (!endpoint) return base || (typeof window !== 'undefined' ? window.location.origin : 'https://backend-1-lawx.onrender.com');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Convenience wrapper around native fetch that prepends the base API URL
 * and automatically injects X-Device-Id and X-Device-Name headers.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = apiUrl(endpoint);
  const deviceHeaders = getDeviceHeaders();
  const mergedHeaders = {
    ...deviceHeaders,
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders
  });
}

