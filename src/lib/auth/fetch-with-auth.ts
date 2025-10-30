import { getToken } from '@/utils/tokenUtils';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  console.log('🚀 fetchWithAuth token:', token); // debug token

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  });
}
