const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/sqlite');
const sessionRoutes = require('./routes/session');
const messageRoutes = require('./routes/message');
const statusRoutes = require('./routes/status');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar o banco de dados
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/session', sessionRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/status', statusRoutes);

// Rota para a documentação da API
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware para tratar rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Documentação disponível em: http://localhost:${PORT}`);
});