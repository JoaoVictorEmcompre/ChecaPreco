const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const precoRoutes = require('./routes/preco');
const estoqueRoutes = require('./routes/estoque');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log detalhado de requisições no terminal

// Rotas da API
app.use('/api/login', loginRoutes);
app.use('/api/preco', precoRoutes);
app.use('/api/estoque', estoqueRoutes);

// Rota de teste (opcional)
app.get('/api/ping', (_, res) => res.json({ status: 'API online' }));

// Inicia servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});