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
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api', apiRoutes);
app.use('/', webRoutes);


// Middleware para tratar rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Documentação disponível em: http://localhost:${PORT}`);
});