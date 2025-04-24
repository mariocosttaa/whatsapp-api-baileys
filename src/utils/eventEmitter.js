const EventEmitter = require('events');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const SessionModel = require('../models/SessionModel');

// Criar uma instância de EventEmitter
const eventEmitter = new EventEmitter();

// Manipular evento de QR Code
eventEmitter.on('qr', async({ sessionName, qr }) => {
    try {
        // Gerar QR code como imagem
        const qrPath = path.join(__dirname, `../../public/qrcodes/${sessionName}.png`);
        await require('qrcode').toFile(qrPath, qr);

        // Atualizar QR code no banco de dados
        await SessionModel.updateSessionQR(sessionName, `/public/qrcodes/${sessionName}.png`);

        // Exibir QR code no terminal (para desenvolvimento)
        qrcode.generate(qr, { small: true });

        console.log(`QR Code gerado para sessão: ${sessionName}`);
    } catch (error) {
        console.error('Erro ao processar QR code:', error);
    }
});

// Manipular evento de status
eventEmitter.on('status', async({ sessionName, status }) => {
    try {
        // Atualizar status no banco de dados
        await SessionModel.updateSessionStatus(sessionName, status);
        console.log(`Status da sessão ${sessionName} atualizado para: ${status}`);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
});

module.exports = eventEmitter;