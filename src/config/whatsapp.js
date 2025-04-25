const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const SessionModel = require('../models/SessionModel');
const eventEmitter = require('../utils/eventEmitter');

// Armazenar sessões ativas
const sessions = {};

// Restaurar sessões ativas ao iniciar o servidor
const restoreSessions = async () => {
    try {
        const activeSessions = await SessionModel.getAllSessions();
        for (const session of activeSessions) {
            if (session.status === 'connected') {
                await createSession(session.name, eventEmitter);
            }
        }
    } catch (error) {
        console.error('Erro ao restaurar sessões:', error);
    }
};

// Caminho para armazenar arquivos de autenticação
const getSessionFolderPath = (sessionName) => {
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

        // Emitir evento de QR Code
        if (qr) {
            console.log(`QR code gerado para ${sessionName}: ${qr}`);
            eventEmitter.emit('qr', { sessionName, qr });
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

// Obter uma sessão existente ou criar uma nova
const getSession = (sessionName) => {
    return sessions[sessionName];
};

// Verificar se uma sessão existe
const sessionExists = (sessionName) => {
    return !!sessions[sessionName];
};

// Encerrar uma sessão
const closeSession = async(sessionName) => {
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