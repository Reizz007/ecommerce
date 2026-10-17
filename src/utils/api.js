/**
 * Centralized API URL and Fetch Utility
 *
 * Supports two deployment modes:
 * 1. Relative Mode (Default): When VITE_API_BASE_URL is empty, requests use relative paths
 *    like '/api/products' (ideal for local Vite dev proxy and Vercel/Nginx rewrites).
 * 2. Cross-Domain Mode: When VITE_API_BASE_URL is set (e.g., 'https://api.yourdomain.com'),
 *    requests automatically target the remote backend host.
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

/**
 * Resolves an endpoint path to a full API URL
 * @param {string} endpoint e.g. '/api/products' or 'api/orders'
 * @returns {string} Fully resolved URL
 */
export function apiUrl(endpoint) {
  if (!endpoint) return API_BASE_URL || '/';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Convenience wrapper around native fetch that prepends the base API URL
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = apiUrl(endpoint);
  return fetch(url, options);
}
