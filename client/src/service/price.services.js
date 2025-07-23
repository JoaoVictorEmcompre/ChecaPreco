import axios from 'axios';
import { getToken } from './token';

const API_RENDER = "https://checapreco.onrender.com";

export const getPrecoPorGrupo = async (groupCode) => {
  const token = getToken();

  const response = await axios.post(`${API_RENDER}/api/preco`, {
    groupCode,
    token,
  });

  return response.data;
};