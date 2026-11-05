import axios from "axios";

export const getPromocao = async (grupo) => {
    const response = await axios.get("/api/promocao", {
        params: {grupo},
    });

    return response.data.promocao;
};
