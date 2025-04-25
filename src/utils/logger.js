const winston = require('winston');
const path = require('path');

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

// Se não estivermos em produção, também log no console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
