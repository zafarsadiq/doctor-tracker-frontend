import { mock } from './mockApi';

const BASE = process.env.NEXT_PUBLIC_API_URL;

async function http(path, { method = 'GET', body, params } = {}) {
  const clean = Object.entries(params || {}).filter(([, v]) => v !== '' && v != null);
  const qs = clean.length ? '?' + new URLSearchParams(clean) : '';
  const res = await fetch(BASE + path + qs, {
    method, credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && path !== '/auth/login' && typeof window !== 'undefined') window.location.assign('/login');
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Something went wrong. Please try again.');
  return json;
}
const enc = encodeURIComponent;

const real = {
  login: (email, password) => http('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => http('/auth/logout', { method: 'POST' }),
  doctors: {
    list: (params) => http('/doctors', { params }),
    get: (id) => http(`/doctors/${id}`),
    create: (body) => http('/doctors', { method: 'POST', body }),
  },
  patients: {
    list: (params) => http('/patients', { params }),
    get: (id) => http(`/patients/${id}`),
    create: (body) => http('/patients', { method: 'POST', body }),
    update: (id, body) => http(`/patients/${id}`, { method: 'PATCH', body }),
    remove: (id) => http(`/patients/${id}`, { method: 'DELETE' }),
  },
  lookups: {
    list: (kind) => http(`/${kind}`),
    add: (kind, name) => http(`/${kind}`, { method: 'POST', body: { name } }),
    rename: (kind, old, name) => http(`/${kind}/${enc(old)}`, { method: 'PATCH', body: { name } }),
    remove: (kind, name) => http(`/${kind}/${enc(name)}`, { method: 'DELETE' }),
  },
  stats: (months) => http('/stats', { params: { months } }),
};

export const api = process.env.NEXT_PUBLIC_USE_MOCK === 'false' ? real : mock;