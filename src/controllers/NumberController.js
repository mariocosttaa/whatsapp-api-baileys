const { getSession } = require('../config/whatsapp');
const logger = require('../utils/logger');
const SessionModel = require('../models/SessionModel');

const verifyNumber = async (req, res) => {
    try {
        const { sessionName, phoneNumber } = req.body;
        
        if (!sessionName || !phoneNumber) {
            return res.status(400).json({
                error: 'Missing required fields: sessionName and phoneNumber'
            });
        }

        const session = getSession(sessionName);
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }

        // Formata o número para o padrão do WhatsApp
        const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');

        // Verificar se o número existe no WhatsApp
        const [result] = await session.onWhatsApp(formattedNumber + '@s.whatsapp.net');

        return res.json({
            exists: result ? true : false
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
