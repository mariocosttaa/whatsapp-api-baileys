const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database/sqlite');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const CleanupService = require('./services/cleanupService');
require('dotenv').config();

const app = express(); 
const PORT = process.env.PORT || 3000;

// Função para reiniciar o servidor
const restartServer = () => {
    logger.info('Mudanças detectadas, reiniciando servidor...');
    process.on('exit', () => {
        require('child_process').spawn(process.argv[0], process.argv.slice(1), {
            cwd: process.cwd(),
            detached: true,
            stdio: 'inherit'
        });
    });
    process.exit(); 
};

// Monitorar mudanças na pasta src
fs.watch(path.join(__dirname), { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        restartServer();
    }
});

// Inicializar o banco de dados
(async () => {
    try {
        await initDatabase();
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        process.exit(1);
    }
})();

// Middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Garantir que o diretório de QR codes existe
const qrcodesDir = path.join(__dirname, '../public/qrcodes');
if (!fs.existsSync(qrcodesDir)) {
    fs.mkdirSync(qrcodesDir, { recursive: true });
}

// Debug middleware para verificar as requisições
app.use((req, res, next) => {
    const requestInfo = `Request: ${req.method} ${req.path} - Body: ${JSON.stringify(req.body)}`;
    logger.info(requestInfo);
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
    logger.info(`Documentação disponível em: ${process.env.APP_URL || 'http://localhost:3000'}`);
    
    // Iniciar serviço de limpeza de QR codes
    CleanupService.startCleanupInterval();
    logger.info('Serviço de limpeza de QR codes iniciado');
});