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

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Logs iniciais
console.log('✅ Iniciando aplicação...');
console.log('🔗 Registrando middlewares e rotas...');

// Rotas da API com logs de carregamento
app.use('/api/login', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/login acessada`);
  next();
}, loginRoutes);

app.use('/api/preco', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/preco acessada`);
  next();
}, precoRoutes);

app.use('/api/estoque', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/estoque acessada`);
  next();
}, estoqueRoutes);

app.use('/api/ean', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/ean acessada`);
  next();
}, eanRoutes);

app.use('/api/cnpj', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/cnpj acessada`);
  next();
}, cnpjRoutes);

app.use('/api/combo', (req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] Rota /api/combo acessada`);
  next();
}, comboRoutes);

// Rota de teste
app.get('/api/ping', (_, res) => {
  console.log(`✅ [${new Date().toISOString()}] Rota /api/ping acessada`);
  res.json({ status: 'API online' });
});

// Captura de 404
app.use((req, res) => {
  console.warn(`⚠️ [404] Caminho não encontrado: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicia servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
