const express = require('express');
const axios = require('axios');
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
            params
        );
        res.json(response.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const errorData = err.response?.data || err.message;
        console.error('[LOGIN] Falha na autenticação. Usuário:', usuario, '| Erro:', errorData);
        res.status(status).json({
            error: 'Falha ao autenticar usuário',
            detalhe: errorData,
        });
    }
});

module.exports = router;
