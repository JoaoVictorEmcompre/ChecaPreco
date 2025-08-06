import axios from 'axios';
import { getToken } from './token';

export const getSku = async (ean) => {
  try {
    const token = getToken();

    const response = await axios.get(`/api/ean`, {
      params: {
        codigo: ean,
        token,
      },
    });

    return response.data.sku;
  } catch (error) {
    return null;
  }
};