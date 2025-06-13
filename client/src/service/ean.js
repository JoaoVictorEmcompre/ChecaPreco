import axios from 'axios';

export const getSku = async (ean) => {
  const response = await axios.get('/api/ean', {
    params: { codigo: ean },
  });

  return response.data.sku;
};