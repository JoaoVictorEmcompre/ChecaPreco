import axios from 'axios';
import { getToken } from './token'; 

const API_PRICE = import.meta.env.VITE_API_PRICE;

/**
 * @param {string}
 * @returns {Promise<number|null>}
 */

export const getPrecoPorGrupo = async (groupCode) => {
  const token = getToken();

  const body = {
    filter: {
      productCodeList: [groupCode],
    },
    option: {
      prices: [
        {
          branchCode: 1,
          priceCodeList: [1],
        },
      ],
    },
    page: 1,
    pageSize: 1000,
  };

  const response = await axios.post(API_PRICE, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const item = response.data.items?.[0];

  const preco = item?.prices?.[0]?.price ?? null;
  const referenceCode = item?.referenceCode ?? null;

  return { price: preco, referenceCode };
};
