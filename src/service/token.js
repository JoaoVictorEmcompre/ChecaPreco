// src/service/token.service.js

/**
 * Este é o local "seguro" para guardar as chaves que usamos no localStorage.
 * Usar constantes evita erros de digitação em outras partes do código.
 */
const TOKEN_KEY = 'authToken';
const USERNAME_KEY = 'username';

/**
 * Salva o token de autenticação no localStorage.
 * @param {string} token O token JWT recebido da API.
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Salva o nome do usuário no localStorage.
 * @param {string} username O nome de usuário recebido da API.
 */
export const saveUsername = (username) => {
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  }
};

/**
 * Obtém o token de autenticação do localStorage.
 * @returns {string|null} O token salvo ou null se não existir.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obtém o nome de usuário salvo do localStorage.
 * @returns {string|null} O nome de usuário salvo ou null se não existir.
 */
export const getUsername = () => {
  return localStorage.getItem(USERNAME_KEY);
};

/**
 * Remove o token e os dados do usuário do localStorage.
 * Essencial para a função de Logout.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  // Opcional: redirecionar para a página de login após o logout
  // window.location.href = '/login';
};