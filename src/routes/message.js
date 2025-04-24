const express = require('express');
const MessageController = require('../controllers/MessageController');
const validators = require('../middleware/validator');
const upload = require('../middleware/upload');

const router = express.Router();

// Enviar mensagem de texto
router.post('/send', validators.sendMessage, MessageController.sendText);

// Enviar mensagem com mídia
router.post('/send-media', upload.single('file'), validators.sendMedia, MessageController.sendMedia);

module.exports = router;