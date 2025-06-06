// Onde vai ficar todos os arquivos de requisição// src/services/authService.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (usuario, password) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', 'bandvestapiv2');
  params.append('client_secret', '4776436009');
  params.append('username', usuario);
  params.append('password', password);

  const response = await axios.post(`${API_BASE_URL}/authorization/v2/token`, params);
  return response.data;
};
