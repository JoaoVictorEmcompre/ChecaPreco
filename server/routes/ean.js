const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({ error: 'Código EAN é obrigatório.' });
  }

  try {
    const url = `${process.env.API_EAN}/${codigo}`;
    const response = await axios.get(url);

    const cdPrd = response.data?.cdPrd;

    if (!cdPrd) {
      return res.status(404).json({ error: 'Produto não encontrado para o EAN informado.' });
    }

    res.json({ sku: cdPrd });
  } catch (err) {
    console.error('Erro ao consultar EAN:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Erro ao consultar EAN' });
  }
});

module.exports = router;