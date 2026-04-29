const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const {sku} = req.query;

    if (!sku) {
        return res.status(400).json({error: 'SKU é obrigatório.'});
    }

    const url = `http://187.95.116.54:9989/pcp/promocao/${sku}`;

    try {
        const response = await axios.get(url, {timeout: 5000});
        const data = response.data || null;

        if (!data || typeof data !== 'object') {
            return res.json({promocao: null});
        }

        const cdProduto = data.cdProduto;
        const vlPromocao = Number(data.vlPromocao);
        const vlAnterior = Number(data.vlAnterior);

        if (String(cdProduto) !== String(sku)) {
            console.warn('[PROMOÇÃO] Produto retornado não corresponde ao SKU. sku:', sku, '| cdProduto:', cdProduto);
            return res.json({promocao: null});
        }

        if (!vlPromocao || !vlAnterior || vlPromocao <= 0 || vlAnterior <= 0) {
            return res.json({promocao: null});
        }

        if (vlPromocao >= vlAnterior) {
            return res.json({promocao: null});
        }

        const percentualDesconto = ((vlAnterior - vlPromocao) / vlAnterior) * 100;

        const promocao = {
            cdProduto: String(cdProduto),
            vlPromocao,
            vlAnterior,
            percentualDesconto: Number(percentualDesconto.toFixed(2)),
        };

        return res.json({promocao});
    } catch (err) {
        const isTimeout = err.code === 'ECONNABORTED' || /timeout/i.test(err.message);
        const noResponse = !err.response;

        if (isTimeout || noResponse) {
            console.warn('[PROMOÇÃO] Timeout/rede indisponível. sku:', sku);
            return res.json({promocao: null});
        }

        const status = err.response?.status || 500;
        const errorData = err.response?.data || err.message;
        console.error('[PROMOÇÃO] Erro ao consultar. sku:', sku, '| Erro:', errorData);
        return res.status(status).json({error: 'Erro ao consultar promoção', details: errorData});
    }
});

module.exports = router;
