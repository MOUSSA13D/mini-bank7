// Resolve API base URL with the following precedence:
// 1) VITE_API_BASE env (set in .env or deployment)
// 2) If running on localhost -> use local backend
// 3) Fallback to deployed backend URL
const inferApiBase = () => {
  // Vite env var
  const envBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  if (envBase && /^https?:\/\//i.test(envBase)) return envBase.replace(/\/$/, '');

  try {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        const port = 4000;
        return `http://localhost:${port}`;
      }
    }
  } catch {}

  return 'https://mini-bank-16.onrender.com';
};

export const API_BASE: string = inferApiBase();

export async function apiFetch(path: string, init?: RequestInit) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
  try {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // Log uniquement en local pour debug
      // eslint-disable-next-line no-console
      console.debug('[apiFetch]', { url, method: init?.method || 'GET' });
    }
  } catch {}
  // Inject Authorization header from localStorage token if not already set
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('token');
      if (token) {
        const headers: Record<string, string> = {};
        // copy existing headers from init if present
        if (init && init.headers) {
          // Headers can be Headers, array or plain object
          if (init.headers instanceof Headers) {
            init.headers.forEach((v, k) => (headers[k] = v));
          } else if (Array.isArray(init.headers)) {
            (init.headers as Array<[string, string]>).forEach(([k, v]) => (headers[k] = v));
          } else {
            Object.assign(headers, init.headers as Record<string, string>);
          }
        }
        if (!headers['Authorization'] && !headers['authorization']) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const newInit: RequestInit = { ...(init || {}), headers };
        return fetch(url, newInit);
      }
    }
  } catch {}
  return fetch(url, init);
}
