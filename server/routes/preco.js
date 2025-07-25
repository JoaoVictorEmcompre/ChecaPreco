const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { groupCode, token } = req.body;

  console.log('📥 [PREÇO] Requisição recebida no POST /api/preco');
  console.log(`🔢 groupCode: ${groupCode || '[FALTANDO]'}`);
  console.log(`🔐 token: ${token ? '[OK]' : '[FALTANDO]'}`);

  if (!groupCode || !token) {
    console.warn('⚠️ [PREÇO] Campos obrigatórios ausentes');
    return res.status(400).json({ error: 'groupCode e token são obrigatórios.' });
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
    console.log('🌐 [PREÇO] Enviando requisição para API externa com body:', body);

    const response = await axios.post(
      'https://ws.facolchoes.com.br:9443/api/totvsmoda/product/v2/prices/search',
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ [PREÇO] Resposta da API externa recebida:', response.data);

    const item = response.data.items?.[0];
    const preco = item?.prices?.[0]?.price ?? null;
    const referenceCode = item?.referenceCode ?? null;

    if (!preco || !referenceCode) {
      console.warn('⚠️ [PREÇO] Dados incompletos na resposta da API externa');
    }

    res.json({ price: preco, referenceCode });
  } catch (err) {
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ [PREÇO] Erro ao consultar preço:', errorData);
    res.status(status).json({ error: 'Erro ao consultar preço', details: errorData });
  }
});

module.exports = router;