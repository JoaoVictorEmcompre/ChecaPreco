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

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use('/api/login', loginRoutes);
app.use('/api/preco', precoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/ean', eanRoutes);
app.use('/api/cnpj', cnpjRoutes);
app.use('/api/combo', comboRoutes);
app.use('/api/promocao', promocaoRoutes);

app.get('/api/ping', (_, res) => res.json({status: 'API online'}));

app.use((req, res) => {
    res.status(404).json({error: 'Rota não encontrada'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
