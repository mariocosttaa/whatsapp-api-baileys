const express = require('express');
const StatusController = require('../controllers/StatusController');
const validators = require('../middleware/validator');

const router = express.Router();

// Enviar status de digitando
router.post('/typing', validators.sendTyping, StatusController.sendTyping);

// Parar de digitar
router.post('/stop-typing', validators.sendTyping, StatusController.stopTyping);

module.exports = router;