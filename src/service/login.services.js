import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_LOGIN;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

export const login = async (usuario, password) => {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: usuario,
    password: password,
  });

  const response = await axios.post(`${API_BASE}/authorization/v2/token`, params);
  return response.data;
};