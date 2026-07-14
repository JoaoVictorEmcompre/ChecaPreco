const express = require('express');
const axios = require('axios');
const https = require('https');
const {logErroApi} = require('../utils/erroApi');
const router = express.Router();

router.get('/', async (req, res) => {
    const {codigo, token} = req.query;

    if (!codigo) {
        return res.status(400).json({error: 'Código EAN é obrigatório.'});
    }

    if (!token) {
        return res.status(400).json({error: 'Token de autenticação é obrigatório.'});
    }

    try {
        const url = `https://bandvest.vcenter.com.br:9443/api/totvsmoda/product/v2/products/${codigo}/1`;
        const agent = new https.Agent({rejectUnauthorized: false});

        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: 5000,
        });

        const produto = response.data?.items?.[0];
        const cdPrd = produto?.productCode;

        if (!cdPrd) {
            console.warn('[EAN] Produto não encontrado. código:', codigo);
            return res.status(404).json({error: 'Produto não encontrado para o EAN informado.'});
        }

        res.json({sku: cdPrd});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('EAN', {
            url: 'product/v2/products',
            err,
            contexto: `codigo=${codigo}`,
        });
        res.status(status).json({error: 'Erro ao consultar EAN', tipo, detalhe: descricao});
    }
});

module.exports = router;
