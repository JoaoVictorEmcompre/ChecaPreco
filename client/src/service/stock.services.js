import axios from 'axios';
import { getToken } from './token';

const API_RENDER = "https://checapreco.onrender.com";

export const getEstoque = async (referenceCode) => {
  const token = getToken();

  const response = await axios.post(`${API_RENDER}/api/estoque`, {
    referenceCode,
    token,
  });

  return response.data;
};