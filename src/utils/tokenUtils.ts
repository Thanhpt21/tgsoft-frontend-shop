import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

const getCookieOptions = () => ({
  expires: 7,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax' as const,
  // domain: '.aiban.vn', 
});


export const saveToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, getCookieOptions());
};


export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};


export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY, { path: '/' }); // ⚠️ Phải có path khi remove
};


export const hasToken = (): boolean => {
  return !!getToken();
};