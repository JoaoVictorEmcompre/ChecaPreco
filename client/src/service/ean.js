import axios from 'axios';

const API_RENDER = "https://checapreco.onrender.com";

export const getSku = async (ean) => {
  const response = await axios.get(`${API_RENDER}/api/ean`, {
    params: { codigo: ean },
  });

  return response.data.sku;
};