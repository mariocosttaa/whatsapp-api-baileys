const { getSession, sessionExists } = require('../config/whatsapp');
const { validationResult } = require('express-validator');

class StatusController {
    // Enviar status de digitando
    static async sendTyping(req, res) {
        try {
            // Validar requisição
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { sessionName, phone, duration } = req.body;

            // Verificar se a sessão existe
            if (!sessionExists(sessionName)) {
                return res.status(404).json({ error: 'Sessão não encontrada ou não conectada' });
            }

            const sock = getSession(sessionName);

            // Formatar número para padrão WhatsApp
            const formattedPhone = phone.includes('@s.whatsapp.net') ?
                phone :
                `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

            // Definir tempo de digitação (padrão: 5 segundos)
            const typingDuration = duration ? parseInt(duration) : 5000;

            // Enviar status de digitando
            await sock.sendPresenceUpdate('composing', formattedPhone);

            // Desativar status após o tempo especificado
            setTimeout(async() => {
                try {
                    if (sessionExists(sessionName)) {
                        await sock.sendPresenceUpdate('paused', formattedPhone);
                    }
                } catch (error) {
                    console.error('Erro ao desativar status de digitando:', error);
                }
            }, typingDuration);

            return res.json({
                message: 'Status de digitando enviado',
                phone,
                sessionName,
                duration: typingDuration
            });
        } catch (error) {
            console.error('Erro ao enviar status de digitando:', error);
            return res.status(500).json({ error: 'Erro ao enviar status de digitando' });
        }
    }

    // Parar de digitar
    static async stopTyping(req, res) {
        try {
            // Validar requisição
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { sessionName, phone } = req.body;

            // Verificar se a sessão existe
            if (!sessionExists(sessionName)) {
                return res.status(404).json({ error: 'Sessão não encontrada ou não conectada' });
            }

            const sock = getSession(sessionName);

            // Formatar número para padrão WhatsApp
            const formattedPhone = phone.includes('@s.whatsapp.net') ?
                phone :
                `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

            // Enviar status de parado
            await sock.sendPresenceUpdate('paused', formattedPhone);

            return res.json({
                message: 'Status de digitando desativado',
                phone,
                sessionName
            });
        } catch (error) {
            console.error('Erro ao desativar status de digitando:', error);
            return res.status(500).json({ error: 'Erro ao desativar status de digitando' });
        }
    }
}

module.exports = StatusController;