const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario, password } = req.body;

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    username: usuario,
    password: password,
  });

  try {
    const response = await axios.post(`${process.env.API_LOGIN}/authorization/v2/token`, params);
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