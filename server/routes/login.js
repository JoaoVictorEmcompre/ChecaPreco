const express = require('express');
const axios = require('axios');
const {logErroApi} = require('../utils/erroApi');
const router = express.Router();

router.post('/', async (req, res) => {
    const {usuario, password} = req.body;

    if (!usuario || !password) {
        return res.status(400).json({error: 'Usuário e senha são obrigatórios.'});
    }

    const params = new URLSearchParams({
        grant_type: 'password',
        client_id: 'bandvestapiv2',
        client_secret: '4776436009',
        username: usuario,
        password: password,
    });

    try {
        const response = await axios.post(
            'https://ws.facolchoes.com.br:9443/api/totvsmoda/authorization/v2/token',
            params,
            {timeout: 5000}
        );
        res.json(response.data);
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('LOGIN', {
            url: 'authorization/v2/token',
            err,
            contexto: `usuario=${usuario}`,
        });
        res.status(status).json({
            error: 'Falha ao autenticar usuário',
            tipo,
            detalhe: descricao,
        });
    }
});

module.exports = router;
