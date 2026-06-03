import axios from 'axios';
import { BASE_URL } from '../config';

// Public client — no auth, used by storefront (Cart, Checkout, LandingPage, etc.)
export const publicApi = axios.create({ baseURL: BASE_URL });

// Admin client — auto-attaches Bearer token
export const adminApi = axios.create({ baseURL: BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Drop-in replacement for the duplicated `apiFetch` helper in every admin page.
 *
 * Call signature mirrors the old fetch-based version:
 *   apiFetch(path, { method, body, headers, ... })
 *
 * `body` (fetch API) is translated to `data` (Axios). FormData is passed as-is
 * so Axios sets the correct multipart Content-Type with boundary automatically.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('Not authenticated');

  const { body, method = 'GET', headers: extraHeaders = {}, ...rest } = options;

  try {
    const { data } = await adminApi({
      url: path,
      method,
      data: body,
      headers: extraHeaders,
      ...rest,
    });
    return data;
  } catch (err) {
    const detail =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      `Request failed (${err.response?.status ?? 'network error'})`;
    throw new Error(detail);
  }
}
