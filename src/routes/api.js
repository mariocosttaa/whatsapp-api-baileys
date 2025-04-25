const express = require('express');
const MessageController = require('../controllers/MessageController');
const NumberController = require('../controllers/NumberController');
const SessionController = require('../controllers/SessionController');
const StatusController = require('../controllers/StatusController');
const validators = require('../middleware/validator');
const upload = require('../middleware/upload');
const validateApiKey = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ welcome: 'Welcome to MarioWhatsApi', version: '1.0' });
});

// Apply API key validation to all routes, except /
router.use('/api', validateApiKey);

// Message Routes
router.post('/message/send', validators.sendMessage, MessageController.sendText);
router.post('/message/send-media', upload.single('file'), validators.sendMedia, MessageController.sendMedia);

// Number Routes
router.get('/number/verify', NumberController.verifyNumber);

// Session Routes
router.post('/session/create', validators.createSession, SessionController.create);
router.get('/session/:sessionName/qr', SessionController.getQR);
router.get('/session/:sessionName/status', SessionController.status);
router.get('/session', SessionController.listAll);
router.post('/session/:sessionName/close', SessionController.close);
router.delete('/session/:sessionName', SessionController.remove);

// Status Routes
router.post('/status/typing', validators.sendTyping, StatusController.sendTyping);
router.post('/status/stop-typing', validators.sendTyping, StatusController.stopTyping);

module.exports = router;