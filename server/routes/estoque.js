const express = require('express');
const axios = require('axios');
const {logErroApi} = require('../utils/erroApi');
const router = express.Router();

router.post('/', async (req, res) => {
    const {referenceCode, token} = req.body;

    if (!referenceCode || !token) {
        return res.status(400).json({error: 'referenceCode e token são obrigatórios.'});
    }

    const body = {
        filter: {
            groupCodeList: [referenceCode],
        },
        option: {
            balances: [
                {
                    branchCode: 1,
                    stockCodeList: [1],
                },
            ],
        },
        page: 1,
        pageSize: 1000,
    };

    try {
        const response = await axios.post(
            'https://ws.facolchoes.com.br:9443/api/totvsmoda/product/v2/balances/search',
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            }
        );
        res.json(response.data.items || []);
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('ESTOQUE', {
            url: 'product/v2/balances/search',
            err,
            contexto: `referenceCode=${referenceCode}`,
        });
        res.status(status).json({error: 'Erro ao consultar estoque', tipo, detalhe: descricao});
    }
});

module.exports = router;
