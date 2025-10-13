const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;

export const API_BASE: string = envBase || 'https://mini-bank-15.onrender.com';

export async function apiFetch(path: string, init?: RequestInit) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
  try {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // Log uniquement en local pour debug
      // eslint-disable-next-line no-console
      console.debug('[apiFetch]', { url, method: init?.method || 'GET' });
    }
  } catch {}
  return fetch(url, init);
}
