const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const precoRoutes = require('./routes/preco');
const estoqueRoutes = require('./routes/estoque');
const eanRoutes = require('./routes/ean');
const cnpjRoutes = require('./routes/cnpj');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rotas da API
app.use('/api/login', loginRoutes);
app.use('/api/preco', precoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/ean', eanRoutes);
app.use('/api/cnpj', cnpjRoutes);

// Rota de teste (opcional)
app.get('/api/ping', (_, res) => res.json({ status: 'API online' }));

// Inicia servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});