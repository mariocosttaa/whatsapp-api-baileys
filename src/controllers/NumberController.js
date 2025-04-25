const { getSession } = require('../config/whatsapp');

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
