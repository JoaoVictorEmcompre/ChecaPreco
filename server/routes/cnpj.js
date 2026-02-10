const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { codigo } = req.query;

    console.log(`📥 [CNPJ] Requisição recebida com query:`, req.query);

    if (!codigo) {
        console.warn('⚠️ [CNPJ] Parâmetro "codigo" ausente');
        return res.status(400).json({ error: 'CNPJ é obrigatório.' });
    }

    try {
        const url = `http://192.168.3.214:8090/pcp/cnpj/${codigo}`;
        console.log(`🔍 [CNPJ] Consultando URL externa: ${url}`);

        const response = await axios.get(url);

        console.log(`✅ [CNPJ] Resposta recebida da API externa:`, response.data);

        const tabDesc = response.data?.tabDesc;

        if (!tabDesc) {
            console.warn('⚠️ [CNPJ] "tabDesc" não encontrado na resposta');
            return res.status(404).json({ error: 'Descrição não encontrada para o CNPJ informado.' });
        }

        console.log('✅ [CNPJ] Retornando descrição para o cliente');
        res.json({ tabDesc });
    } catch (err) {
        console.error('❌ [CNPJ] Erro ao consultar CNPJ:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: 'Erro ao consultar CNPJ' });
    }
});

module.exports = router;
