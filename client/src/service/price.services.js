import axios from 'axios';
import { getToken } from './token'; // você ainda pode manter isso se necessário

export const getPrecoPorGrupo = async (groupCode) => {
  const token = getToken();

  const response = await axios.post('/api/preco', {
    groupCode,
    token,
  });

  return response.data;
};