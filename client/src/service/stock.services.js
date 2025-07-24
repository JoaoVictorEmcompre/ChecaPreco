import axios from 'axios';
import { getToken } from './token';

export const getEstoque = async (referenceCode) => {
  const token = getToken();

  const response = await axios.post(`/api/estoque`, {
    referenceCode,
    token,
  });

  return response.data;
};