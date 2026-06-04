// API base URL configuration
//
// PRODUCTION (default):
//   BASE_URL = "https://marvelsteel1.com/api"
//   Nginx at marvelsteel1.com proxies /api/* → backend and strips the /api prefix.
//   All API calls are built as `${BASE_URL}/api/v1/...` which produces the double
//   prefix /api/api/v1/... — nginx strips one /api, so the backend receives /api/v1/...
//   This is intentional and required for the current nginx config.
//
// LOCAL DEVELOPMENT (no nginx proxy):
//   Change BASE_URL to "http://localhost:8000" (no /api suffix).
//   Then all calls built as `${BASE_URL}/api/v1/...` hit the backend directly.
//   The apiClient.js Axios instance uses this as its baseURL.

export const BASE_URL = "https://marvelsteel1.com/api";

// To switch to local dev, comment the line above and uncomment:
// export const BASE_URL = "http://localhost:8000";
