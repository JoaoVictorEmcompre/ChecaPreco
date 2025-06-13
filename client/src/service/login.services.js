import axios from 'axios';

const API_BASE = '/api';

export const login = async (usuario, password) => {
  try {
    const response = await axios.post(`${API_BASE}/login`, {
      usuario,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};