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
    'Accept': 'application/json',
    ...deviceHeaders,
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders
  });
}

/**
 * Safe JSON fetch wrapper with retry logic for sleeping/deploying backend services.
 * Automatically handles non-JSON HTML error pages (502/503/404) gracefully.
 *
 * @param {string} endpoint e.g. '/api/topup/games'
 * @param {RequestInit} [options]
 * @param {number} [retries=2] Number of retries on network/502/503/HTML failure
 * @param {number} [delayMs=1500] Delay between retries
 * @returns {Promise<any>}
 */
export async function fetchJson(endpoint, options = {}, retries = 2, delayMs = 1500) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await apiFetch(endpoint, options);
      const contentType = res.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        // When server is spinning up or restarting, Render/Cloudflare returns HTML
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw new Error(
          res.status === 404
            ? 'Endpoint route not found (404).'
            : 'Top-up server is waking up or deploying. Please click Retry in a few seconds.'
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `Server error (${res.status})`);
      }
      return data;
    } catch (err) {
      lastError = err;
      // Do not retry 400 validation errors or not found
      if (err.message && (err.message.includes('404') || err.message.includes('422'))) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Connection error. Please try again.');
}

