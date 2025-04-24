const { getSession, sessionExists } = require('../config/whatsapp');
const { validationResult } = require('express-validator');
const fs = require('fs');

class MessageController {
    // Enviar mensagem de texto
    static async sendText(req, res) {
        try {
            // Validar requisição
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { sessionName, phone, message } = req.body;

            // Verificar se a sessão existe
            if (!sessionExists(sessionName)) {
                return res.status(404).json({ error: 'Sessão não encontrada ou não conectada' });
            }

            const sock = getSession(sessionName);

            // Formatar número para padrão WhatsApp
            const formattedPhone = phone.includes('@s.whatsapp.net') ?
                phone :
                `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

            // Enviar mensagem
            await sock.sendMessage(formattedPhone, {
                text: message
            });

            return res.json({
                message: 'Mensagem enviada com sucesso',
                phone,
                sessionName
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    }

    // Enviar mensagem com mídia (imagem, documento, etc)
    static async sendMedia(req, res) {
        try {
            // Verificar se há arquivo
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            const { sessionName, phone, caption } = req.body;
            const { path: filePath, mimetype } = req.file;

            // Verificar se a sessão existe
            if (!sessionExists(sessionName)) {
                // Remover arquivo temporário
                fs.unlinkSync(filePath);
                return res.status(404).json({ error: 'Sessão não encontrada ou não conectada' });
            }

            const sock = getSession(sessionName);

            // Formatar número para padrão WhatsApp
            const formattedPhone = phone.includes('@s.whatsapp.net') ?
                phone :
                `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

            // Ler arquivo como buffer
            const fileBuffer = fs.readFileSync(filePath);

            // Configurar mensagem de acordo com o tipo de mídia
            let messageOptions = {};

            if (mimetype.startsWith('image/')) {
                messageOptions = {
                    image: fileBuffer,
                    caption: caption || ''
                };
            } else if (mimetype.startsWith('video/')) {
                messageOptions = {
                    video: fileBuffer,
                    caption: caption || ''
                };
            } else {
                // Enviar como documento
                messageOptions = {
                    document: fileBuffer,
                    mimetype: mimetype,
                    fileName: req.file.originalname,
                    caption: caption || ''
                };
            }

            // Enviar mensagem
            await sock.sendMessage(formattedPhone, messageOptions);

            // Remover arquivo temporário
            fs.unlinkSync(filePath);

            return res.json({
                message: 'Mídia enviada com sucesso',
                phone,
                sessionName,
                mediaType: mimetype
            });
        } catch (error) {
            console.error('Erro ao enviar mídia:', error);

            // Remover arquivo temporário em caso de erro
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({ error: 'Erro ao enviar mídia' });
        }
    }
}

module.exports = MessageController;