import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY); // đọc cookie trên client
  
};

export const saveToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY, { path: '/' });
};

export const hasToken = (): boolean => !!getToken();
