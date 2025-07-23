import axios from 'axios';
import { getToken } from './token';

const API_RENDER = "https://checapreco.onrender.com";

export const getSku = async (ean) => {
  const token = getToken();

  const response = await axios.get(`${API_RENDER}/api/ean`, {
    params: {
      codigo: ean,
      token,
    },
  });

  return response.data.sku;
};