const { createSession, getSession, sessionExists, closeSession, getAllSessions } = require('../config/whatsapp');
const SessionModel = require('../models/SessionModel');
const eventEmitter = require('../utils/eventEmitter');
const fs = require('fs');
const path = require('path');

class SessionController {

    // Criar uma nova sessão
    static async create(req, res) {
        try {
            const { sessionName } = req.body;

            if (!sessionName) {
                return res.status(400).json({ error: 'Nome da sessão é obrigatório' });
            }

            // Verificar se a sessão já existe no banco de dados
            const existingSession = await SessionModel.getSession(sessionName);
            if (existingSession) {
                return res.status(409).json({ error: 'Sessão já existe' });
            }

            // Criar registro no banco de dados
            await SessionModel.createSession(sessionName);

            // Verificar se a sessão já existe no sistema
            if (sessionExists(sessionName)) {
                return res.status(409).json({ error: 'Sessão já existe no sistema' });
            }

            // Promessa para capturar o QR code
            const qrCodePromise = new Promise((resolve, reject) => {
                // Escutar o evento de QR code
                const qrListener = ({ sessionName: emittedSessionName, qr }) => {
                    if (emittedSessionName === sessionName) {
                        console.log(`QR code recebido para ${sessionName}: ${qr}`);
                        eventEmitter.off('qr', qrListener); // Remover o listener após receber
                        resolve(qr);
                    }
                };
                eventEmitter.on('qr', qrListener);

                // Timeout para evitar espera infinita (30 segundos)
                setTimeout(() => {
                    eventEmitter.off('qr', qrListener); // Remover o listener no timeout
                    reject(new Error('Timeout ao gerar QR code'));
                }, 30000);
            });

            // Criar nova sessão do WhatsApp
            console.log(`Iniciando criação da sessão ${sessionName}`);
            await createSession(sessionName, eventEmitter);

            // Esperar pelo QR code
            const qrCode = await qrCodePromise;

            // Atualizar o QR code no banco de dados
            await SessionModel.updateSessionQR(sessionName, qrCode);

            const APP_URL = process.env.APP_URL || 'http://localhost:3000';
            const qrUrl = `${APP_URL}/qrcodes/${sessionName}.png`;

            return res.json({
                message: 'Sessão criada com sucesso',
                sessionName,
                qrCode,
                qrCodeUrl: qrUrl
            });
        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            return res.status(500).json({ error: 'Erro ao criar sessão: ' + error.message });
        }
    }

    // Obter QR code de uma sessão
    static async getQR(req, res) {
        try {
            const { sessionName } = req.params;

            // Verificar se a sessão existe no banco de dados
            const session = await SessionModel.getSession(sessionName);

            if (!session) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }

            // Verificar se há QR code disponível
            if (!session.qr_code) {
                return res.status(404).json({ error: 'QR code não disponível' });
            }

            // Gerar QR code como imagem se ainda não existir
            const qrcode = require('qrcode');
            const crypto = require('crypto');
            const path = require('path');
            const fs = require('fs');

            const qrFileName = `${crypto.randomBytes(16).toString('hex')}.png`;
            const qrPath = path.join(__dirname, '../../public/qrcodes', qrFileName);
            
            // Garantir que o diretório existe
            const qrDir = path.dirname(qrPath);
            if (!fs.existsSync(qrDir)) {
                fs.mkdirSync(qrDir, { recursive: true });
            }
            
            // Gerar e salvar o QR code
            await qrcode.toFile(qrPath, session.qr_code);
            
            // Construir URL do QR code
            const APP_URL = process.env.APP_URL || 'http://localhost:3000';
            const qrUrl = `${APP_URL}/qrcodes/${qrFileName}`;

            return res.json({
                sessionName,
                qrCode: session.qr_code,
                qrCodeUrl: qrUrl
            });
        } catch (error) {
            const logger = require('../utils/logger');
            logger.error('Erro ao obter QR code:', error);
            return res.status(500).json({ error: 'Erro ao obter QR code' });
        }
    }

    // Verificar status de uma sessão
    static async status(req, res) {
        try {
            const { sessionName } = req.params;

            // Verificar se a sessão existe no banco de dados
            const session = await SessionModel.getSession(sessionName);

            if (!session) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }

            // Verificar se a sessão está ativa no sistema
            const isActive = sessionExists(sessionName);

            return res.json({
                sessionName,
                status: session.status,
                isActive
            });
        } catch (error) {
            console.error('Erro ao verificar status da sessão:', error);
            return res.status(500).json({ error: 'Erro ao verificar status da sessão' });
        }
    }

    // Listar todas as sessões
    static async listAll(req, res) {
        try {
            // Obter todas as sessões do banco de dados
            const sessions = await SessionModel.getAllSessions();

            // Obter sessões ativas
            const activeSessions = getAllSessions();

            // Adicionar informação de sessão ativa
            const sessionsWithStatus = sessions.map(session => ({
                ...session,
                isActive: activeSessions.includes(session.session_name)
            }));

            return res.json(sessionsWithStatus);
        } catch (error) {
            console.error('Erro ao listar sessões:', error);
            return res.status(500).json({ error: 'Erro ao listar sessões' });
        }
    }

    // Fechar uma sessão
    static async close(req, res) {
        try {
            const { sessionName } = req.params;

            // Verificar se a sessão existe
            if (!sessionExists(sessionName)) {
                return res.status(404).json({ error: 'Sessão não encontrada ou já encerrada' });
            }

            // Fechar sessão
            await closeSession(sessionName);

            // Atualizar status no banco
            await SessionModel.updateSessionStatus(sessionName, 'disconnected');

            return res.json({
                message: 'Sessão encerrada com sucesso',
                sessionName
            });
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            return res.status(500).json({ error: 'Erro ao encerrar sessão' });
        }
    }

    // Remover uma sessão completamente
    static async remove(req, res) {
        try {
            const { sessionName } = req.params;

            // Fechar sessão se estiver ativa
            if (sessionExists(sessionName)) {
                await closeSession(sessionName);
            }

            // Remover do banco de dados
            const result = await SessionModel.deleteSession(sessionName);

            // Remover arquivos da sessão
            const sessionFolder = path.join(__dirname, `../../sessions/${sessionName}`);
            if (fs.existsSync(sessionFolder)) {
                fs.rmSync(sessionFolder, { recursive: true, force: true });
            }

            // Remover QR code
            const qrPath = path.join(__dirname, `../../public/qrcodes/${sessionName}.png`);
            if (fs.existsSync(qrPath)) {
                fs.unlinkSync(qrPath);
            }

            if (!result.deleted) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }

            return res.json({
                message: 'Sessão removida com sucesso',
                sessionName
            });
        } catch (error) {
            console.error('Erro ao remover sessão:', error);
            return res.status(500).json({ error: 'Erro ao remover sessão' });
        }
    }
}

module.exports = SessionController;