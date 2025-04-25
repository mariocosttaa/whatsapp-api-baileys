const express = require('express');
const apiRoutes = require('./routes/api');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para logging de requisições
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error({
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    res.status(500).json({ error: 'Internal Server Error' });
});

// Use API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;
