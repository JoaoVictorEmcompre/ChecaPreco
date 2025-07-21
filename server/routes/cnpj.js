const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { codigo } = req.query;

    if (!codigo) {
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    try {
        const url = `${process.env.API_CNPJ}/${codigo}`;
        const response = await axios.get(url);

        const tabDesc = response.data?.tabDesc;

        if (!tabDesc) {
            return res.status(404).json({ error: 'Descrição não encontrada para o CNPJ informado.' });
        }

        res.json({ tabDesc });
    } catch (err) {
        console.error('Erro ao consultar CNPJ:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: 'Erro ao consultar CNPJ' });
    }
});

module.exports = router;