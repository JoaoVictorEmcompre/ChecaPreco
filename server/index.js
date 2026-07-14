const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const precoRoutes = require('./routes/preco');
const estoqueRoutes = require('./routes/estoque');
const eanRoutes = require('./routes/ean');
const cnpjRoutes = require('./routes/cnpj');
const comboRoutes = require('./routes/combo');
const promocaoRoutes = require('./routes/promocao');
const pedidosCompraRoutes = require('./routes/pedidosCompra');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'combined'));

app.use('/api/login', loginRoutes);
app.use('/api/preco', precoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/ean', eanRoutes);
app.use('/api/cnpj', cnpjRoutes);
app.use('/api/combo', comboRoutes);
app.use('/api/promocao', promocaoRoutes);
app.use('/api/pedidos-compra', pedidosCompraRoutes);

app.get('/api/ping', (_, res) => res.json({status: 'API online'}));

app.use((req, res) => {
    res.status(404).json({error: 'Rota não encontrada'});
});

// Middleware final de erro: captura qualquer exceção não tratada dentro de uma rota
// (síncrona, ou assíncrona repassada via next(err)/rejeição de Promise no Express 5)
// e responde com uma mensagem clara em vez de deixar a requisição travada ou o processo cair.
app.use((err, req, res, _next) => {
    console.error(`[SERVIDOR] Erro não tratado em ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);
    res.status(500).json({error: 'Erro interno no servidor', detalhe: err.message});
});

process.on('unhandledRejection', (reason) => {
    console.error('[SERVIDOR] Promise rejeitada sem tratamento:', reason?.stack || reason);
});

process.on('uncaughtException', (err) => {
    console.error('[SERVIDOR] Exceção não capturada:', err.stack || err.message);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[SERVIDOR] Não foi possível iniciar: a porta ${PORT} já está em uso por outro processo.`);
    } else {
        console.error('[SERVIDOR] Erro ao iniciar o servidor:', err.stack || err.message);
    }
    process.exit(1);
});
