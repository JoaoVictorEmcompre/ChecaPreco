const express = require('express');
const axios = require('axios');
const {logErroApi} = require('../utils/erroApi');
const router = express.Router();

router.post('/', async (req, res) => {
    const {groupCode, token} = req.body;

    if (!groupCode || !token) {
        return res.status(400).json({error: 'groupCode e token são obrigatórios.'});
    }

    const body = {
        filter: {
            productCodeList: [groupCode],
        },
        option: {
            prices: [
                {
                    branchCode: 1,
                    priceCodeList: [1],
                },
            ],
        },
        page: 1,
        pageSize: 1000,
    };

    try {
        const response = await axios.post(
            'https://ws.facolchoes.com.br:9443/api/totvsmoda/product/v2/prices/search',
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            }
        );

        const item = response.data.items?.[0];
        const preco = item?.prices?.[0]?.price ?? null;
        const referenceCode = item?.referenceCode ?? null;

        if (!preco || !referenceCode) {
            console.warn('[PREÇO] Dados incompletos na resposta. groupCode:', groupCode);
        }

        res.json({price: preco, referenceCode});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('PREÇO', {
            url: 'product/v2/prices/search',
            err,
            contexto: `groupCode=${groupCode}`,
        });
        res.status(status).json({error: 'Erro ao consultar preço', tipo, detalhe: descricao});
    }
});

module.exports = router;
