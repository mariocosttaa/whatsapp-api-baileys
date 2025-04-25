const { getSession, sessionExists } = require('../config/whatsapp');
const { validationResult } = require('express-validator');
const fs = require('fs');

class MessageController {
    // Enviar mensagem de texto
    static async sendText(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({
                    error: 'Request body is missing'
                });
            }

            const { sessionName, phone, message } = req.body;

            if (!sessionName) {
                return res.status(400).json({
                    error: 'Missing required field: sessionName'
                });
            }

            if (!phone) {
                return res.status(400).json({
                    error: 'Missing required field: phone'
                });
            }

            if (!message) {
                return res.status(400).json({
                    error: 'Missing required field: message'
                });
            }

            const caption = req.body.caption;

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
            if (!req.body) {
                return res.status(400).json({
                    error: 'Request body is missing'
                });
            }

            const { sessionName: mediaSessionName, phone: mediaPhone, caption } = req.body;

            if (!mediaSessionName) {
                return res.status(400).json({
                    error: 'Missing required field: sessionName'
                });
            }

            if (!mediaPhone) {
                return res.status(400).json({
                    error: 'Missing required field: phone'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    error: 'Missing required field: file'
                });
            }

            // Verificar se a sessão existe
            if (!sessionExists(mediaSessionName)) {
                // Remover arquivo temporário
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Sessão não encontrada ou não conectada' });
            }

            const sock = getSession(mediaSessionName);

            // Formatar número para padrão WhatsApp
            const formattedPhone = mediaPhone.includes('@s.whatsapp.net') ?
                mediaPhone :
                `${mediaPhone.replace(/\D/g, '')}@s.whatsapp.net`;

            // Ler arquivo
            const buffer = fs.readFileSync(req.file.path);
            const mimeType = req.file.mimetype;

            // Preparar mensagem com mídia
            const mediaMessage = {
                mimetype: mimeType,
                buffer
            };

            // Adicionar legenda se fornecida
            if (caption) {
                mediaMessage.caption = caption;
            }

            // Enviar mensagem com mídia
            await sock.sendMessage(formattedPhone, {
                image: mediaMessage
            });

            // Remover arquivo temporário
            fs.unlinkSync(req.file.path);

            return res.json({
                message: 'Mensagem com mídia enviada com sucesso',
                phone: mediaPhone,
                sessionName: mediaSessionName,
                mediaType: mimeType
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem com mídia:', error);
            // Tentar remover arquivo temporário em caso de erro
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Erro ao remover arquivo temporário:', unlinkError);
                }
            }
            return res.status(500).json({ error: 'Erro ao enviar mensagem com mídia' });
        }
    }
}

module.exports = MessageController;