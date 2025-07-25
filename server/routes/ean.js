const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// ⚠️ Ignora validação SSL por completo (dev only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.get('/', async (req, res) => {
  const { codigo, token } = req.query;

  console.log('📥 [EAN] Requisição recebida');
  console.log(`📦 Código EAN: ${codigo || '[FALTANDO]'}`);
  console.log(`🔐 Token: ${token ? '[OK]' : '[FALTANDO]'}`);

  if (!codigo) {
    console.warn('⚠️ [EAN] Código EAN ausente na requisição');
    return res.status(400).json({ error: 'Código EAN é obrigatório.' });
  }

  if (!token) {
    console.warn('⚠️ [EAN] Token ausente na requisição');
    return res.status(400).json({ error: 'Token de autenticação é obrigatório.' });
  }

  try {
    const url = `https://bandvest.vcenter.com.br:9443/api/totvsmoda/product/v2/products/${codigo}/1`;
    console.log('🌐 [EAN] Fazendo requisição para URL externa:', url);

    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ [EAN] Resposta da API externa recebida:', response.data);

    const produto = response.data?.items?.[0];
    const cdPrd = produto?.productCode;

    if (!cdPrd) {
      console.warn('⚠️ [EAN] Produto não encontrado na resposta');
      return res.status(404).json({ error: 'Produto não encontrado para o EAN informado.' });
    }

    console.log('✅ [EAN] Produto encontrado. Enviando resposta ao cliente...');
    res.json({ sku: cdPrd });
  } catch (err) {
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ [EAN] Erro ao consultar EAN:', errorData);
    res.status(status).json({ error: 'Erro ao consultar EAN', details: errorData });
  }
});

module.exports = router;
