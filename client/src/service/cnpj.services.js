import axios from 'axios';

const API_RENDER = "https://checapreco.onrender.com";

export const getDesc = async (cnpj) => {
    const response = await axios.get(`${API_RENDER}/api/cnpj`, {
        params: { codigo: cnpj },
    });

    return response.data.tabDesc;
};
