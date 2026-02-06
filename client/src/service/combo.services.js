import axios from 'axios';

export const getCombo = async (groupCode) => {
  const response = await axios.get(`/api/combo`, {
    params: { groupCode },
  });
  return response.data.combos || [];
};
