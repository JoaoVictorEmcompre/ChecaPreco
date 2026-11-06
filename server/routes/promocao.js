const express = require('express');
const axios = require('axios');
const {logErroApi, TIPOS_INDISPONIVEL} = require('../utils/erroApi');
const router = express.Router();

const PCP_BASE_URL = process.env.PCP_BASE_URL || 'http://187.95.116.54:9989';

router.get('/', async (req, res) => {
    const {grupo} = req.query;

    if (!grupo) {
        return res.status(400).json({error: 'grupo é obrigatório.'});
    }

    const url = `${PCP_BASE_URL}/pcp/promocao/grupo/${encodeURIComponent(grupo)}`;

    try {
        const response = await axios.get(url, {timeout: 5000});
        const data = response.data || null;

        if (!data || typeof data !== 'object') {
            return res.json({promocao: null});
        }

        const cdGrupo = data.cdGrupo;
        const vlPromocao = Number(data.vlPromocao);
        const vlAnterior = Number(data.vlAnterior);

        if (String(cdGrupo) !== String(grupo)) {
            console.warn('[PROMOÇÃO] Grupo retornado não corresponde ao grupo buscado. grupo:', grupo, '| cdGrupo:', cdGrupo);
            return res.json({promocao: null});
        }

        if (!vlPromocao || !vlAnterior || vlPromocao <= 0 || vlAnterior <= 0) {
            return res.json({promocao: null});
        }

        if (vlPromocao >= vlAnterior) {
            return res.json({promocao: null});
        }

        const percentualDesconto = ((vlAnterior - vlPromocao) / vlAnterior) * 100;

        const promocao = {
            cdGrupo: String(cdGrupo),
            dsGrupo: data.dsGrupo,
            vlPromocao,
            vlAnterior,
            percentualDesconto: Number(percentualDesconto.toFixed(2)),
        };

        return res.json({promocao});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('PROMOÇÃO', {
            url,
            err,
            contexto: `grupo=${grupo}`,
        });

        if (TIPOS_INDISPONIVEL.includes(tipo)) {
            return res.json({promocao: null});
        }

        return res.status(status).json({error: 'Erro ao consultar promoção', tipo, detalhe: descricao});
    }
});

module.exports = router;
