const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { groupCode } = req.query;

  console.log('📥 [COMBO] Requisição recebida no GET /api/combo');
  console.log(`🔢 groupCode: ${groupCode || '[FALTANDO]'}`);

  if (!groupCode) {
    console.warn('⚠️ [COMBO] Parâmetro "groupCode" ausente');
    return res.status(400).json({ error: 'groupCode é obrigatório.' });
  }

  const url = `http://192.168.3.214:8090/pcp/combo/${groupCode}`;
  console.log(`🌐 [COMBO] Consultando URL externa: ${url}`);

  try {
    const response = await axios.get(url, { timeout: 5000 });
    const data = Array.isArray(response.data) ? response.data : [];

    console.log('✅ [COMBO] Resposta recebida da API externa. Itens:', data.length);

    const agora = new Date();

    const normalizaData = (dt) => {
      if (typeof dt !== 'string') return null;
      const base = dt.replace(' ', 'T').replace(/\.0$/, '');
      const d = new Date(base);
      return isNaN(d.getTime()) ? null : d;
    };

    const filtrados = data
      .filter(item => String(item.cdProduto) === String(groupCode))
      .map(item => {
        const dt = normalizaData(item.dtValidade);
        return {
          quantidade: Number(item.quantidade) || 0,
          percentual: Number(item.percentual) || 0,
          dtValidade: item.dtValidade,
          _dt: dt,
        };
      })
      .filter(item => item._dt && agora < item._dt)
      .filter(item => item.quantidade > 0 && item.percentual > 0);

    const porQuantidade = {};
    filtrados.forEach(it => {
      const q = it.quantidade;
      if (!porQuantidade[q] || it.percentual > porQuantidade[q].percentual) {
        porQuantidade[q] = { quantidade: it.quantidade, percentual: it.percentual, dtValidade: it.dtValidade };
      }
    });

    const combos = Object.values(porQuantidade).sort((a, b) => a.quantidade - b.quantidade);

    if (combos.length === 0) {
      console.warn('⚠️ [COMBO] Nenhum combo válido encontrado');
    } else {
      console.log('✅ [COMBO] Combos válidos:', combos);
    }

    res.json({ combos });
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED' || /timeout/i.test(err.message);
    const noResponse = !err.response;
    if (isTimeout || noResponse) {
      console.warn('⚠️ [COMBO] Timeout/rede indisponível ao consultar combos. Retornando lista vazia.');
      return res.json({ combos: [] });
    }
    const status = err.response?.status || 500;
    const errorData = err.response?.data || err.message;

    console.error('❌ [COMBO] Erro ao consultar combos:', errorData);
    res.status(status).json({ error: 'Erro ao consultar combos', details: errorData });
  }
});

module.exports = router;
