const express = require('express');
const axios = require('axios');
const {logErroApi, TIPOS_INDISPONIVEL} = require('../utils/erroApi');
const router = express.Router();

const PCP_BASE_URL = process.env.PCP_BASE_URL || 'http://187.95.116.54:9989';

router.get('/', async (req, res) => {
    const {sku} = req.query;

    if (!sku) {
        return res.status(400).json({error: 'SKU é obrigatório.'});
    }

    const url = `${PCP_BASE_URL}/pcp/promocao/${sku}`;

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
        const {status, tipo, descricao} = logErroApi('PROMOÇÃO', {
            url,
            err,
            contexto: `sku=${sku}`,
        });

        if (TIPOS_INDISPONIVEL.includes(tipo)) {
            return res.json({promocao: null});
        }

        return res.status(status).json({error: 'Erro ao consultar promoção', tipo, detalhe: descricao});
    }
});

module.exports = router;
