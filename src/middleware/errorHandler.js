// Middleware para tratar erros
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Garantir que a resposta seja sempre JSON
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        status: err.status || 500
    });
};

// Middleware para tratar rotas não encontradas
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        status: 404
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};