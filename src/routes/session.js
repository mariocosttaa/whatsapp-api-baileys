const express = require('express');
const SessionController = require('../controllers/SessionController');
const validators = require('../middleware/validator');

const router = express.Router();

// Criar nova sessão
router.post('/create', validators.createSession, SessionController.create);

// Obter QR code
router.get('/:sessionName/qr', SessionController.getQR);

// Verificar status da sessão
router.get('/:sessionName/status', SessionController.status);

// Listar todas as sessões
router.get('/', SessionController.listAll);

// Fechar sessão
router.post('/:sessionName/close', SessionController.close);

// Remover sessão
router.delete('/:sessionName', SessionController.remove);

module.exports = router;