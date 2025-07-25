const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { referenceCode, token } = req.body;

  console.log('📥 [ESTOQUE] Requisição recebida no POST /api/estoque');
  console.log(`📦 referenceCode: ${referenceCode || '[FALTANDO]'}`);
  console.log(`🔐 token: ${token ? '[OK]' : '[FALTANDO]'}`);

  if (!referenceCode || !token) {
    console.warn('⚠️ [ESTOQUE] Dados obrigatórios faltando no body');
    return res.status(400).json({ error: 'referenceCode e token são obrigatórios.' });
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
    console.log('🌐 [ESTOQUE] Enviando requisição para API externa com corpo:', body);

    const response = await axios.post(
      'https://ws.facolchoes.com.br:9443/api/totvsmoda/product/v2/balances/search',
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ [ESTOQUE] Resposta da API externa recebida com sucesso');
    res.json(response.data.items || []);
  } catch (err) {
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ [ESTOQUE] Erro ao consultar estoque:', errorData);
    res.status(status).json({ error: 'Erro ao consultar estoque', details: errorData });
  }
});

module.exports = router;
