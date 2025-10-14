
export const API_BASE: string = 'https://mini-bank-16.onrender.com';

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
