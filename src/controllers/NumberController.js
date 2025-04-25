const { getSession } = require('../config/whatsapp');
const logger = require('../utils/logger');
const SessionModel = require('../models/SessionModel');

const verifyNumber = async (req, res) => {
    try {
        // Log da requisição recebida
        logger.info('Verify number request:', {
            body: req.body,
            headers: req.headers
        });

        if (!req.body) {
            return res.status(400).json({
                error: 'Request body is missing'
            });
        }

        const { sessionName, phoneNumber } = req.body;
        
        if (!sessionName || !phoneNumber) {
            return res.status(400).json({
                error: 'Missing required fields: sessionName and phoneNumber'
            });
        }

        // Verificar status da sessão no banco de dados
        const dbSession = await SessionModel.getSession(sessionName);
        if (!dbSession) {
            return res.status(404).json({
                error: 'Session not found in database'
            });
        }

        if (dbSession.status !== 'connected') {
            return res.status(400).json({
                error: `Session is not connected. Current status: ${dbSession.status}`
            });
        }

        const session = getSession(sessionName);
        if (!session) {
            // Tentar restaurar a sessão
            logger.info(`Attempting to restore session ${sessionName}`);
            await require('../config/whatsapp').restoreSessions();
            
            const restoredSession = getSession(sessionName);
            if (!restoredSession) {
                return res.status(404).json({
                    error: 'Session not found in memory. Please reconnect.'
                });
            }
            session = restoredSession;
        }

        // Formata o número para o padrão do WhatsApp
        const formattedNumber = phoneNumber.includes('@s.whatsapp.net') 
            ? phoneNumber 
            : `${phoneNumber}@s.whatsapp.net`;

        const [result] = await session.onWhatsApp(formattedNumber);
        
        if (!result) {
            return res.json({
                status: false,
                number: phoneNumber
            });
        }

        // Se o número existe, busca informações adicionais
        const userInfo = await session.getName(formattedNumber);
        
        return res.json({
            status: true,
            number: phoneNumber,
            name: userInfo.name || userInfo.notify || undefined
        });

    } catch (error) {
        console.error('Error verifying number:', error);
        return res.status(500).json({
            error: 'Internal server error while verifying number'
        });
    }
};

module.exports = {
    verifyNumber
};
