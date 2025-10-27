import axios from "axios";

// Create a preconfigured axios instance for your API
const api = axios.create({
  baseURL: 'https://056a5507a95a.ngrok-free.app/api',
  headers: {
    // ngrok free sometimes serves a browser interstitial page unless this
    // header is present. Setting this header tells ngrok to skip the warning
    // and forward the request to your backend, so you get JSON instead of HTML.
    // Any truthy value works.
    'ngrok-skip-browser-warning': 'true',
    // Ask specifically for JSON to avoid content-type/content-negotiation issues.
    'Accept': 'application/json',
  },
});

// Attach token from localStorage (if present) to every request.
// This keeps the rest of the app code clean — you don't need to manually
// set Authorization for each request. We read from localStorage on each
// request so updates to the saved token are picked up without a page reload.
api.interceptors.request.use((config) => {
  try {
    const get = (storage) => {
      try { return storage.getItem('account') } catch { return null }
    }
    const raw = get(sessionStorage) || get(localStorage)
    if (raw) {
      const account = JSON.parse(raw)
      if (account && account.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${account.token}`
      }
    }
  } catch {
    // ignore parse errors and proceed without auth header
  }
  return config
})

export default api;