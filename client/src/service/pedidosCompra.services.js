import axios from 'axios';
import {getToken} from './token';

export const getPedidosCompra = async (skus) => {
    if (!Array.isArray(skus) || skus.length === 0) return [];

    const token = getToken();

    const response = await axios.post('/api/pedidos-compra', {
        skus,
        token,
    });

    return response.data.pedidos || [];
};
