const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { groupCode, token } = req.body;

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
    const response = await axios.post(process.env.API_PRICE, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const item = response.data.items?.[0];
    const preco = item?.prices?.[0]?.price ?? null;
    const referenceCode = item?.referenceCode ?? null;

    res.json({ price: preco, referenceCode });
  } catch (err) {
    console.error('Erro ao consultar preço:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Erro ao consultar preço' });
  }
});

module.exports = router;
