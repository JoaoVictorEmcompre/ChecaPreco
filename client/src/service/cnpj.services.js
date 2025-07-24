import axios from 'axios';


export const getDesc = async (cnpj) => {
    const response = await axios.get(`/api/cnpj`, {
        params: { codigo: cnpj },
    });

    return response.data.tabDesc;
};
