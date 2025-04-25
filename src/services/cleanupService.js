const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CleanupService {
    static cleanQRCodes() {
        const qrcodesDir = path.join(__dirname, '../../public/qrcodes');
        
        // Verificar se o diretório existe
        if (!fs.existsSync(qrcodesDir)) {
            return;
        }

        try {
            // Ler todos os arquivos no diretório
            const files = fs.readdirSync(qrcodesDir);
            
            // Remover cada arquivo
            files.forEach(file => {
                const filePath = path.join(qrcodesDir, file);
                fs.unlinkSync(filePath);
                logger.info(`QR code removido: ${file}`);
            });

            logger.info(`Limpeza de QR codes concluída. ${files.length} arquivos removidos.`);
        } catch (error) {
            logger.error('Erro ao limpar QR codes:', error);
        }
    }

    static startCleanupInterval() {
        // Executar limpeza a cada 5 minutos
        const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos em milissegundos
        
        setInterval(() => {
            logger.info('Iniciando limpeza automática de QR codes...');
            this.cleanQRCodes();
        }, CLEANUP_INTERVAL);

        // Executar uma limpeza inicial
        this.cleanQRCodes();
    }
}

module.exports = CleanupService;
