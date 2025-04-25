const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const crypto = require('crypto');
const SessionModel = require('../models/SessionModel');
const eventEmitter = require('../utils/eventEmitter');
const logger = require('../utils/logger');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Armazenar sessões ativas
const sessions = {};

// Restaurar sessões ativas ao iniciar o servidor
const restoreSessions = async () => {
    try {
        const activeSessions = await SessionModel.getAllSessions();
        if (!activeSessions || !Array.isArray(activeSessions)) return;
        
        for (const session of activeSessions) {
            if (session.status === 'connected' && session.session_name) {
                await createSession(session.session_name, eventEmitter);
            }
        }
    } catch (error) {
        // Ignora erro se a tabela ainda não existir
        if (!error.message?.includes('no such table')) {
            logger.error('Erro ao restaurar sessões:', error);
        }
    }
};

// Caminho para armazenar arquivos de autenticação
const getSessionFolderPath = (sessionName) => {
    if (!sessionName) {
        throw new Error('Missing required parameter: sessionName');
    }
    return path.join(__dirname, '../../sessions', sessionName);
};

// Criar pasta de sessão se não existir
const ensureSessionFolder = (sessionName) => {
    const sessionFolder = getSessionFolderPath(sessionName);
    if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
    }
    return sessionFolder;
};

// Iniciar uma sessão do WhatsApp
const createSession = async(sessionName, eventEmitter) => {
    if (!sessionName) {
        throw new Error('Missing required parameter: sessionName');
    }
    if (!eventEmitter) {
        throw new Error('Missing required parameter: eventEmitter');
    }
    // Garantir que a pasta de sessão existe
    const sessionFolder = ensureSessionFolder(sessionName);

    // Carregar estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    // Criar conexão com WhatsApp
    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        browser: ['WhatsApp API', 'Chrome', '1.0.0']
    });

    // Gerenciar eventos de conexão
    sock.ev.on('connection.update', async(update) => {
        const { connection, lastDisconnect, qr } = update;

        // Gerar e salvar QR Code
        if (qr) {
            try {
                // Gerar nome único para o arquivo QR
                const qrFileName = `${crypto.randomBytes(16).toString('hex')}.png`;
                const qrPath = path.join(__dirname, '../../public/qrcodes', qrFileName);
                
                // Garantir que o diretório existe
                const qrDir = path.dirname(qrPath);
                if (!fs.existsSync(qrDir)) {
                    fs.mkdirSync(qrDir, { recursive: true });
                }
                
                // Gerar e salvar o QR code
                await qrcode.toFile(qrPath, qr);
                
                // Construir URL do QR code
                const qrUrl = `${APP_URL}/qrcodes/${qrFileName}`;
                
                logger.info(`QR code gerado para ${sessionName}`, { qrUrl });
                eventEmitter.emit('qr', { sessionName, qr, qrUrl });
            } catch (error) {
                logger.error('Erro ao processar QR code:', error);
            }
        }

        if (connection === 'close') {

            let shouldReconnect = false;
            if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output) {
                shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            } else {
                shouldReconnect = true; // Se não houver detalhes de erro, tenta reconectar por padrão
            }

            if (shouldReconnect) {
                // Tentar reconectar
                eventEmitter.emit('status', { sessionName, status: 'reconnecting' });
                sessions[sessionName] = await createSession(sessionName, eventEmitter);
            } else {
                // Desconectado
                eventEmitter.emit('status', { sessionName, status: 'disconnected' });
                delete sessions[sessionName];
            }
        } else if (connection === 'open') {
            // Conectado com sucesso
            eventEmitter.emit('status', { sessionName, status: 'connected' });
        }
    });

    // Salvar credenciais quando atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Adicionar à lista de sessões
    sessions[sessionName] = sock;

    return sock;
};

// Obter uma sessão existente
const getSession = (sessionName) => {
    if (!sessionName) {
        throw new Error('Missing required parameter: sessionName');
    }
    return sessions[sessionName];
};

// Verificar se uma sessão existe
const sessionExists = (sessionName) => {
    if (!sessionName) {
        throw new Error('Missing required parameter: sessionName');
    }
    return !!sessions[sessionName];
};

// Fechar uma sessão
const closeSession = async (sessionName) => {
    if (!sessionName) {
        throw new Error('Missing required parameter: sessionName');
    }
    if (sessions[sessionName]) {
        await sessions[sessionName].logout();
        delete sessions[sessionName];
        return true;
    }
    return false;
};

// Listar todas as sessões ativas
const getAllSessions = () => {
    return Object.keys(sessions);
};

// Restaurar sessões ao exportar o módulo
restoreSessions();

module.exports = {
    createSession,
    getSession,
    sessionExists,
    closeSession,
    getAllSessions,
    restoreSessions
};