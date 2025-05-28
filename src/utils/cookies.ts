import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { Context } from 'hono';

const cookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
};

export const setAccessTokenCookie = (c: Context, token: string) => {
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  setCookie(c, 'accessToken', token, {
    ...cookieConfig,
    expires,
    maxAge: 15 * 60, // 15 minutes
  });
};

export const setRefreshTokenCookie = (c: Context, token: string) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  setCookie(c, 'refreshToken', token, {
    ...cookieConfig,
    expires,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
};

export const getAccessTokenFromCookie = (c: Context) => {
  return getCookie(c, 'accessToken');
};

export const getRefreshTokenFromCookie = (c: Context) => {
  return getCookie(c, 'refreshToken');
};

export const clearTokenCookies = (c: Context) => {
  deleteCookie(c, 'accessToken', {
    ...cookieConfig,
  });

  deleteCookie(c, 'refreshToken', {
    ...cookieConfig,
  });
};

export const setTokenCookies = (c: Context, accessToken: string, refreshToken: string) => {
  setAccessTokenCookie(c, accessToken);
  setRefreshTokenCookie(c, refreshToken);
};