const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario, password } = req.body;

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: "bandvestapiv2",
    client_secret: "4776436009",
    username: usuario,
    password: password,
  });

  try {
    const response = await axios.post(`https://ws.facolchoes.com.br:9443/api/totvsmoda/authorization/v2/token`, params);
    res.json(response.data);
  } catch (err) {
    console.error('Erro na autenticação:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Falha ao autenticar usuário',
      detalhe: err.response?.data || null,
    });
  }
});

module.exports = router;