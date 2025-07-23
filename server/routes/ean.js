const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// ⚠️ Ignora validação SSL por completo (dev only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.get('/', async (req, res) => {
  const { codigo, token } = req.query;

  console.log('🔍 Iniciando consulta de EAN');
  console.log('📦 Código EAN recebido:', codigo);
  console.log('🔐 Token recebido:', token ? '[OK]' : '[FALTANDO]');

  if (!codigo) {
    return res.status(400).json({ error: 'Código EAN é obrigatório.' });
  }

  if (!token) {
    return res.status(400).json({ error: 'Token de autenticação é obrigatório.' });
  }

  try {
    const url = `${process.env.API_EAN}/${codigo}/1`;
    console.log('🌐 URL de consulta:', url);

    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const produto = response.data?.items?.[0];
    const cdPrd = produto?.productCode;

    if (!cdPrd) {
      return res.status(404).json({ error: 'Produto não encontrado para o EAN informado.' });
    }

    res.json({ sku: cdPrd });
  } catch (err) {
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ Erro ao consultar EAN:', errorData);
    res.status(status).json({ error: 'Erro ao consultar EAN', details: errorData });
  }
});

module.exports = router;