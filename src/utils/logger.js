const winston = require('winston');
const path = require('path');

// Formato personalizado para logs de requisição
const requestFormat = winston.format.printf(({ message, timestamp }) => {
    // Verifica se a mensagem começa com 'Request'
    if (message.startsWith('Request')) {
        return `${message}`;
    }
    return '';
});

// Logger principal para arquivos
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../storage/system.log'),
            level: 'info'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../storage/error.log'),
            level: 'error'
        })
    ]
});

// Adicionar console transport apenas para logs de requisição
logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp(),
        requestFormat
    ),
    level: 'info'
}));

module.exports = logger;
