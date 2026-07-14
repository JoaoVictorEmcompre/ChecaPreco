const express = require('express');
const axios = require('axios');
const {logErroApi, TIPOS_INDISPONIVEL} = require('../utils/erroApi');
const router = express.Router();

const PCP_BASE_URL = process.env.PCP_BASE_URL || 'http://187.95.116.54:9989';

router.get('/', async (req, res) => {
    const {groupCode} = req.query;

    if (!groupCode) {
        return res.status(400).json({error: 'groupCode é obrigatório.'});
    }

    const url = `${PCP_BASE_URL}/pcp/combo/${groupCode}`;

    try {
        const response = await axios.get(url, {timeout: 5000});
        const data = Array.isArray(response.data) ? response.data : [];

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
                porQuantidade[q] = {quantidade: it.quantidade, percentual: it.percentual, dtValidade: it.dtValidade};
            }
        });

        const combos = Object.values(porQuantidade).sort((a, b) => a.quantidade - b.quantidade);

        res.json({combos});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('COMBO', {
            url,
            err,
            contexto: `groupCode=${groupCode}`,
        });

        if (TIPOS_INDISPONIVEL.includes(tipo)) {
            return res.json({combos: []});
        }

        res.status(status).json({error: 'Erro ao consultar combos', tipo, detalhe: descricao});
    }
});

module.exports = router;
