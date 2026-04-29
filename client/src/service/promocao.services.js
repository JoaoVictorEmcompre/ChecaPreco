import axios from "axios";

export const getPromocao = async (sku) => {
    const response = await axios.get("/api/promocao", {
        params: {sku},
    });

    return response.data.promocao;
};