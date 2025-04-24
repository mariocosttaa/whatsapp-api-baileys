const { body } = require('express-validator');

// Validadores para as várias rotas
const validators = {
    // Validação para criar sessão
    createSession: [
        body('sessionName')
        .notEmpty().withMessage('Nome da sessão é obrigatório')
        .isString().withMessage('Nome da sessão deve ser uma string')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Nome da sessão deve conter apenas letras, números, hífen e underscore')
    ],

    // Validação para enviar mensagem
    sendMessage: [
        body('sessionName')
        .notEmpty().withMessage('Nome da sessão é obrigatório')
        .isString().withMessage('Nome da sessão deve ser uma string'),
        body('phone')
        .notEmpty().withMessage('Número de telefone é obrigatório')
        .isString().withMessage('Número de telefone deve ser uma string'),
        body('message')
        .notEmpty().withMessage('Mensagem é obrigatória')
        .isString().withMessage('Mensagem deve ser uma string')
    ],

    // Validação para enviar mídia
    sendMedia: [
        body('sessionName')
        .notEmpty().withMessage('Nome da sessão é obrigatório')
        .isString().withMessage('Nome da sessão deve ser uma string'),
        body('phone')
        .notEmpty().withMessage('Número de telefone é obrigatório')
        .isString().withMessage('Número de telefone deve ser uma string')
    ],

    // Validação para status de digitando
    sendTyping: [
        body('sessionName')
        .notEmpty().withMessage('Nome da sessão é obrigatório')
        .isString().withMessage('Nome da sessão deve ser uma string'),
        body('phone')
        .notEmpty().withMessage('Número de telefone é obrigatório')
        .isString().withMessage('Número de telefone deve ser uma string'),
        body('duration')
        .optional()
        .isInt({ min: 1000, max: 60000 }).withMessage('Duração deve ser entre 1000 e 60000 milissegundos')
    ]
};

module.exports = validators;