const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario, password } = req.body;

  console.log('📥 [LOGIN] Requisição recebida no POST /api/login');
  console.log(`👤 Usuário: ${usuario || '[FALTANDO]'}`);
  console.log(`🔒 Senha: ${password ? '[RECEBIDA]' : '[FALTANDO]'}`);

  if (!usuario || !password) {
    console.warn('⚠️ [LOGIN] Campos obrigatórios ausentes no corpo da requisição');
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: 'bandvestapiv2',
    client_secret: '4776436009',
    username: usuario,
    password: password,
  });

  try {
    console.log('🔐 [LOGIN] Enviando requisição para API de autenticação...');
    const response = await axios.post(
      'https://ws.facolchoes.com.br:9443/api/totvsmoda/authorization/v2/token',
      params
    );

    console.log('✅ [LOGIN] Autenticação bem-sucedida');
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ [LOGIN] Falha na autenticação:', errorData);
    res.status(status).json({
      error: 'Falha ao autenticar usuário',
      detalhe: errorData,
    });
  }
});

module.exports = router;
