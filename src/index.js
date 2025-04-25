const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/sqlite');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar o banco de dados
(async () => {
    try {
        await initDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
})();

// Middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware para verificar o corpo das requisições
app.use((req, res, next) => {
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
});

app.use('/public', express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/', webRoutes);
app.use('/', apiRoutes);


// Middleware para tratar rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Documentação disponível em: http://localhost:${PORT}`);
});