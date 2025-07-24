const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { referenceCode, token } = req.body;

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
    const response = await axios.post("https://ws.facolchoes.com.br:9443/api/totvsmoda/product/v2/balances/search", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data.items || []);
  } catch (err) {
    console.error('Erro ao consultar estoque:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Erro ao consultar estoque' });
  }
});

module.exports = router;
