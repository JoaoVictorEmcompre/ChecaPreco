import axios from 'axios';
import { getToken } from './token';

const API_STOCK = import.meta.env.VITE_API_STOCK;

/**
 * Consulta variações de produto por referenceCode
 * @param {string} referenceCode - Código de referência retornado pela API de preços
 * @returns {Promise<Object[]>} - Lista de variações com estoque e detalhes
 */
export const getEstoque = async (referenceCode) => {
  const token = getToken();

  const body = {
    filter: {
      referenceCode: [referenceCode],
    },
    option: {
      balances: [
        {
          branchCode: 1,
          stockCodeList: [1],
        },
      ],
    },
    page: 1,
    pageSize: 1000,
  };

  const response = await axios.post(API_STOCK, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.items || [];
};
