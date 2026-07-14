const express = require('express');
const axios = require('axios');
const {logErroApi} = require('../utils/erroApi');
const router = express.Router();

const PCP_BASE_URL = process.env.PCP_BASE_URL || 'http://187.95.116.54:9989';

router.get('/', async (req, res) => {
    const {codigo} = req.query;

    if (!codigo) {
        return res.status(400).json({error: 'CNPJ é obrigatório.'});
    }

    const url = `${PCP_BASE_URL}/pcp/cnpj/${codigo}`;

    try {
        const response = await axios.get(url, {timeout: 5000});
        const percentual = response.data?.percentual;

        if (!percentual) {
            console.warn('[CNPJ] Percentual não encontrado. código:', codigo);
            return res.status(404).json({error: 'Descrição não encontrada para o CNPJ informado.'});
        }

        res.json({percentual});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('CNPJ', {
            url,
            err,
            contexto: `codigo=${codigo}`,
        });
        res.status(status).json({error: 'Erro ao consultar CNPJ', tipo, detalhe: descricao});
    }
});

module.exports = router;
