const TOKEN_KEY = 'access_token';

export const saveToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};
