const API = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000';

export function getToken(): string | null {
    return localStorage.getItem('dokify_token');
}
export function setToken(token: string) {
    localStorage.setItem('dokify_token', token);
}
export function clearToken() {
    localStorage.removeItem('dokify_token');
}

export async function api(path: string, init: RequestInit = {}) {
    const headers: any = { 'content-type': 'application/json', ...(init.headers || {}) };
    const token = getToken();
    if (token) headers['authorization'] = `Bearer ${token}`;
    const res = await fetch(API + path, { ...init, headers });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}


